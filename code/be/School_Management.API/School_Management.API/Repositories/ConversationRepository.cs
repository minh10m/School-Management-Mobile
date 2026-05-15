using CloudinaryDotNet.Actions;
using CloudinaryDotNet;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using School_Management.API.Data;
using School_Management.API.Exceptions;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using School_Management.API.Services;
using FirebaseAdmin.Messaging;

namespace School_Management.API.Repositories
{
    public class ConversationRepository : IConversationRepository
    {
        private readonly ApplicationDbContext context;
        private readonly IFirebaseService firebaseService;
        private readonly UserManager<AppUser> userManager;
        private readonly ILogger<ConversationRepository> logger;
        private readonly Cloudinary cloudinary;

        public ConversationRepository(ApplicationDbContext context, IFirebaseService firebaseService, UserManager<AppUser> userManager, ILogger<ConversationRepository> logger, Cloudinary cloudinary)
        {
            this.context = context;
            this.firebaseService = firebaseService;
            this.userManager = userManager;
            this.logger = logger;
            this.cloudinary = cloudinary;
        }

        public async Task<(bool result, string message)> AddMembersToGroup(AddMembersRequest request, Guid userId)
        {
            var conversation = await context.Conversation
        .FirstOrDefaultAsync(x => x.Id == request.ConversationId && x.IsGroup);
            if (conversation == null) return (false, "NOT_FOUND_GROUP");

            // Check người thực hiện có trong nhóm không
            var isInGroup = await context.UserConversation
                .AnyAsync(x => x.ConversationId == request.ConversationId && x.UserId == userId);
            if (!isInGroup) return (false, "NOT_IN_GROUP");

            // Lọc ra những người chưa có trong nhóm để tránh duplicate
            var existingMemberIds = await context.UserConversation
                .Where(x => x.ConversationId == request.ConversationId)
                .Select(x => x.UserId)
                .ToListAsync();

            var newMemberIds = request.MemberIds
                .Where(id => !existingMemberIds.Contains(id))
                .Distinct()
                .ToList();

            if (newMemberIds.Count == 0) return (false, "ALREADY_IN_GROUP");

            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var userConversations = newMemberIds.Select(memberId => new UserConversation
                {
                    Id = Guid.NewGuid(),
                    UserId = memberId,
                    ConversationId = request.ConversationId,
                    UnReadCount = 0
                }).ToList();
                await context.UserConversation.AddRangeAsync(userConversations);

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Cập nhật members trên Firestore
                var allMemberIds = existingMemberIds.Concat(newMemberIds).ToList();
                await firebaseService.UpdateGroupMembers(request.ConversationId, allMemberIds);

                return (true, "SUCCESS");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        public async Task<(bool result, string message)> LeaveGroup(Guid conversationId, Guid userId)
        {
            var conversation = await context.Conversation
                .FirstOrDefaultAsync(x => x.Id == conversationId && x.IsGroup);
            if (conversation == null) return (false, "NOT_FOUND_GROUP");

            var userConversation = await context.UserConversation
                .FirstOrDefaultAsync(x => x.ConversationId == conversationId && x.UserId == userId);
            if (userConversation == null) return (false, "NOT_IN_GROUP");

            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                context.UserConversation.Remove(userConversation);
                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                var remainingMemberIds = await context.UserConversation
                    .Where(x => x.ConversationId == conversationId)
                    .Select(x => x.UserId)
                    .ToListAsync();

                await firebaseService.UpdateGroupMembers(conversationId, remainingMemberIds);

                return (true, "SUCCESS");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        public async Task<CheckMessageExistedResponse> CheckMessageExisted(CheckMessageExistedRequest request)
        {
            var senderId = request.SenderId;
            var receiverId = request.ReceiverId;

            var conversationId = await context.UserConversation
                .AsNoTracking()
                .Where(uc => uc.UserId == senderId && !uc.Conversation.IsGroup)
                .Where(uc => context.UserConversation.Any(inner =>
                    inner.ConversationId == uc.ConversationId && inner.UserId == receiverId))
                .Select(uc => (Guid?)uc.ConversationId) 
                .FirstOrDefaultAsync();

            return new CheckMessageExistedResponse { ConversationId = conversationId };
        }

        public async Task<(Guid? conversationId, string message)> CreateGroup(CreateGroupRequest request, Guid creatorId)
        {
            if (request.MemberIds.Count < 2) return (null, "NOT_ENOUGH_MEMBERS");

            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                string? avatarUrl = null;
                string? publicId = null;
                if (request.Avatar != null)
                {
                    var maxSize = 2 * 1024 * 1024;

                    if (request.Avatar.Length > maxSize)
                        throw new BadRequestException("Ảnh đại diện không được quá 2MB");

                    if (request.Avatar.Length > 0)
                    {
                        using var stream = request.Avatar.OpenReadStream();

                        var uploadParams = new ImageUploadParams
                        {
                            File = new FileDescription(request.Avatar.FileName, stream),
                            Folder = "avatars",
                            PublicId = Guid.NewGuid().ToString(),
                            Type = "upload",
                            Transformation = new Transformation().Width(400).Height(400).Crop("fill").Gravity("face"),
                            AccessMode = "public"
                        };

                        var uploadResult = await cloudinary.UploadAsync(uploadParams);

                        if (uploadResult.Error != null)
                            throw new Exception("Lỗi hệ thống");

                        avatarUrl = uploadResult.SecureUrl.ToString();
                        publicId = uploadResult.PublicId;
                    }
                }
                var group = new Conversation
                {
                    Id = Guid.NewGuid(),
                    ConversationName = request.GroupName,
                    IsGroup = true,
                    ConversationAvatarUrl = avatarUrl,
                    PublicId = publicId,
                    CreatedAt = DateTimeOffset.UtcNow,
                    LastUpdatedAt = DateTimeOffset.UtcNow
                };
                await context.Conversation.AddAsync(group);

                var allMembers = request.MemberIds.Append(creatorId).Distinct().ToList();
                var userConversations = allMembers.Select(memberId => new UserConversation
                {
                    Id = Guid.NewGuid(),
                    UserId = memberId,
                    ConversationId = group.Id,
                    UnReadCount = 0
                }).ToList();
                await context.UserConversation.AddRangeAsync(userConversations);

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                await firebaseService.CreateGroupConversation(group.Id, allMembers);

                return (group.Id, "SUCCESS");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<(GetMessageResponse? result, string message)> GetMessage(BaseRequestSecond request, Guid conversationId, Guid userId)
        {
            var userConversation = await context.UserConversation
                                                .FirstOrDefaultAsync(x => x.ConversationId == conversationId && x.UserId == userId);
            if (userConversation == null) return (null, "NOT_IN_CONVERSATION");

            var conversation = await context.Conversation.FirstOrDefaultAsync(x => x.Id == conversationId);
            if (conversation == null) return (null, "NOT_FOUND_CONVERSATION");

            // Set unread = 0
            userConversation.UnReadCount = 0;

            // Set Seen cho các message chưa seen của người khác
            await context.Message
                .Where(x => x.ConversationId == conversationId &&
                            x.SenderId != userId &&
                            x.Status == "Đã gửi")
                .ExecuteUpdateAsync(y => y.SetProperty(m => m.Status, "Đã xem"));

            await context.SaveChangesAsync();
            await firebaseService.ResetUnreadCount(conversationId, userId);

            var query = context.Message.AsNoTracking()
                .Where(x => x.ConversationId == conversationId)
                .OrderByDescending(x => x.CreatedAt);

            var totalCount = await query.CountAsync();
            var skip = (request.PageNumber - 1) * request.PageSize;

            var messages = await query.Skip(skip).Take(request.PageSize)
                .Select(x => new MessageResponse
                {
                    Id = x.Id,
                    SenderId = x.SenderId,
                    SenderName = x.User.FullName,
                    Content = x.Content,
                    Status = x.Status,
                    Type = x.Type,
                    CreatedAt = x.CreatedAt
                }).ToListAsync();

            var members = await context.UserConversation
                .AsNoTracking()
                .Where(x => x.ConversationId == conversationId)
                .Select(x => new MemberInfo
                {
                    UserId = x.UserId,
                    FullName = x.User.FullName,
                    AvatarUrl = x.User.AvatarUrl
                }).ToListAsync();

            return (new GetMessageResponse
            {
                MemberInfos = members,
                MessageResponse = new PagedResponse<MessageResponse>
                {
                    Items = messages,
                    PageNumber = request.PageNumber,
                    PageSize = request.PageSize,
                    TotalCount = totalCount
                }
            }, "SUCCESS");
        }

        public async Task<PagedResponse<ConversationResponse>> GetMyConversation(GetConversationFilterRequest request, Guid userId)
        {
            var query = context.Conversation.AsNoTracking().Where(x => x.UserConversations.Any(uc => uc.UserId == userId)).AsQueryable();

            if(!string.IsNullOrWhiteSpace(request.DisplayName))
            {
                var name = request.DisplayName.Trim().ToLower();
                query = query.Where(x => x.IsGroup 
                    ? x.ConversationName.ToLower().Contains(name) 
                    : x.UserConversations.Any(uc => uc.UserId != userId && uc.User.FullName.ToLower().Contains(name)));
            }

            //sorting
            query = query.OrderByDescending(x => x.LastUpdatedAt);

            var totalCount = await query.CountAsync();
            var skipResults = (request.PageNumber - 1) * request.PageSize;

            var listResult = await query.Skip(skipResults).Take(request.PageSize)
                                        .Select(g => new ConversationResponse
                                        {
                                            ConversationId = g.Id,
                                            IsGroup = g.IsGroup,
                                            DisplayName = g.IsGroup ? g.ConversationName : g.UserConversations.Where(uc => uc.UserId != userId).Select(y => y.User.FullName).FirstOrDefault(),
                                            LastUpdatedAt = g.LastUpdatedAt,
                                            AvatarUrl = g.IsGroup ? g.ConversationAvatarUrl : g.UserConversations.Where(uc => uc.UserId != userId).Select(y => y.User.AvatarUrl).FirstOrDefault(),
                                            UnReadCount = g.UserConversations.Where(uc => uc.UserId == userId).Select(y => y.UnReadCount).FirstOrDefault(),
                                            LastMessage = g.Messages.OrderByDescending(m => m.CreatedAt).Select(m => m.Content).FirstOrDefault()
                                        }).ToListAsync();
            return new PagedResponse<ConversationResponse>
            {
                Items = listResult,
                PageSize = request.PageSize,
                PageNumber = request.PageNumber,
                TotalCount = totalCount
            };

        }

        public async Task<(Guid? conversationId, string message)> SendMessage(SendMessageRequest request, Guid senderId)
        {
            var finalConversationId = request.ConversationId ?? Guid.NewGuid();
            Models.Domain.Message message = null;
            List<Guid> receiverIds = new List<Guid>();
            var sender = await userManager.FindByIdAsync(senderId.ToString());
            string senderName = sender?.FullName ?? "Người dùng";

            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                if (request.ConversationId.HasValue)
                {
                    receiverIds = await context.UserConversation
                        .Where(x => x.ConversationId == request.ConversationId && x.UserId != senderId)
                        .Select(x => x.UserId)
                        .ToListAsync();

                    message = new Models.Domain.Message
                    {
                        Id = Guid.NewGuid(),
                        SenderId = senderId,
                        Type = "user",
                        Status = "Đã gửi",
                        Content = request.Content,
                        ConversationId = request.ConversationId.Value,
                        CreatedAt = DateTimeOffset.UtcNow,
                    };

                    await context.Conversation
                        .Where(x => x.Id == request.ConversationId)
                        .ExecuteUpdateAsync(y => y.SetProperty(c => c.LastUpdatedAt, DateTimeOffset.UtcNow));

                    await context.UserConversation
                        .Where(x => x.ConversationId == request.ConversationId && x.UserId != senderId)
                        .ExecuteUpdateAsync(y => y.SetProperty(uc => uc.UnReadCount, uc => uc.UnReadCount + 1));

                    context.Message.Add(message);
                }
                else
                {
                    if (request.ReceiverId == null) return (null, "RECEIVER_REQUIRED");

                    receiverIds = new List<Guid> { request.ReceiverId.Value };

                    var conversation = new Conversation
                    {
                        Id = finalConversationId,
                        IsGroup = false,
                        CreatedAt = DateTimeOffset.UtcNow,
                        LastUpdatedAt = DateTimeOffset.UtcNow
                    };

                    var userConversations = new List<UserConversation>
            {
                new() { Id = Guid.NewGuid(), ConversationId = finalConversationId, UserId = senderId, UnReadCount = 0 },
                new() { Id = Guid.NewGuid(), ConversationId = finalConversationId, UserId = request.ReceiverId.Value, UnReadCount = 1 }
            };

                    message = new Models.Domain.Message
                    {
                        Id = Guid.NewGuid(),
                        SenderId = senderId,
                        Status = "Đã gửi",
                        Type = "user",
                        Content = request.Content,
                        ConversationId = finalConversationId,
                        CreatedAt = DateTimeOffset.UtcNow,
                    };

                    context.Conversation.Add(conversation);
                    context.UserConversation.AddRange(userConversations);
                    context.Message.Add(message);
                }

                await context.SaveChangesAsync();
                await transaction.CommitAsync(); 
            }
            catch (Exception ex)
            {
                if (context.Database.CurrentTransaction != null)
                {
                    await transaction.RollbackAsync();
                }
                logger.LogError(ex, "Lỗi SQL khi gửi tin nhắn");
                throw;
            }

            try
            {
                await firebaseService.UpdateConversation(finalConversationId, receiverIds, message, senderName);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "SQL lưu thành công nhưng Firebase Signal thất bại");
            }

            return (finalConversationId, "SUCCESS");
        }

        public async Task<(ConversationResponse? result, string message)> UpdateConversation(UpdateGroupRequest request, Guid conversationId, Guid senderId)
        {
            var conversation = await context.Conversation.FirstOrDefaultAsync(x => x.Id == conversationId);
            if (conversation == null) return (null, "NOT_FOUND_CONVERSATION");
            var conversationInfo = string.Empty;
            bool isChangeAvatar = false;
            bool isChangeConversationName = false;

            var sender = await userManager.FindByIdAsync(senderId.ToString());
            string senderName = sender?.FullName ?? "Người dùng";

            var receiverIds = await context.UserConversation.AsNoTracking().Where(x => x.UserId != senderId && x.ConversationId == conversationId).Select(g => g.UserId).ToListAsync();

            string? avatarUrl = conversation.ConversationAvatarUrl;
            string? publicId = conversation.PublicId;
            string? oldPublicId = conversation.PublicId;

            if (request.Avatar != null && request.Avatar.Length > 0)
            {
                if (request.Avatar.Length > 2 * 1024 * 1024)
                    return (null, "BIGGER_THAN_2MB");

                // --- BƯỚC 2: UPLOAD ẢNH MỚI ---
                using var stream = request.Avatar.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(request.Avatar.FileName, stream),
                    Folder = "avatars",
                    PublicId = Guid.NewGuid().ToString(),
                    Transformation = new Transformation().Width(500).Height(500).Crop("fill") // Tip: Nén ảnh luôn
                };

                var uploadResult = await cloudinary.UploadAsync(uploadParams);

                if (uploadResult.Error != null)
                    return (null, "UPLOAD_TO_CLOUDINARY_FAILED");

                avatarUrl = uploadResult.SecureUrl.ToString();
                publicId = uploadResult.PublicId;
                isChangeAvatar = true;

                _ = Task.Run(async () =>
                {
                    try
                    {
                        var deletionParams = new DeletionParams(oldPublicId) { ResourceType = ResourceType.Image };
                        await cloudinary.DestroyAsync(deletionParams);
                        logger.LogInformation("Xóa ảnh thành công");
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, "Không thể xóa ảnh cũ trên Cloudinary");
                    }
                });
            }

            if (!string.IsNullOrWhiteSpace(request.ConversationName) && conversation.ConversationName != request.ConversationName)
            {
                conversation.ConversationName = request.ConversationName;
                isChangeConversationName = true;
            }

            conversation.ConversationAvatarUrl = avatarUrl;
            conversation.PublicId = publicId;

            if (isChangeAvatar && isChangeConversationName) conversationInfo = $"{senderName} đã thay đổi tên nhóm và ảnh đại diện";
            else if (isChangeAvatar && !isChangeConversationName) conversationInfo = $"{senderName} đã thay đổi ảnh đại diện";
            else if (!isChangeAvatar && isChangeConversationName) conversationInfo = $"{senderName} đã thay đổi tên nhóm";
            else conversationInfo = "không có gì thay đổi";

            var message = new Models.Domain.Message
            {
                SenderId = senderId,
                Content = conversationInfo,
                ConversationId = conversationId,
                Status = "Đã gửi",
                CreatedAt = DateTimeOffset.UtcNow,
                Id = Guid.NewGuid(),
                Type = "system"
            };

            context.Message.Add(message);
            await context.SaveChangesAsync();

            try
            {
                await firebaseService.UpdateConversation(conversationId, receiverIds, message, senderName);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "SQL lưu thành công nhưng Firebase Signal thất bại");
            }

            return (new ConversationResponse
            {
                AvatarUrl = conversation.ConversationAvatarUrl,
                DisplayName = conversation.ConversationName,
                ConversationId = conversation.Id
            }, "SUCCESS");

        }
    }
}
