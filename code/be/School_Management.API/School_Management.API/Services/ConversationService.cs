using School_Management.API.Exceptions;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class ConversationService : IConversationService
    {
        private readonly IConversationRepository conversationRepository;

        public ConversationService(IConversationRepository conversationRepository)
        {
            this.conversationRepository = conversationRepository;
        }

        public async Task<bool> AddMembersToGroup(AddMembersRequest request, Guid userId)
        {
            var (result, message) = await conversationRepository.AddMembersToGroup(request, userId);
            return message switch
            {
                "NOT_IN_GROUP" => throw new NotFoundException("Bạn không ở trong nhóm"),
                "NOT_FOUND_GROUP" => throw new NotFoundException("Không tìm thấy nhóm"),
                "ALREADY_IN_GROUP" => throw new ConflictException("Người bạn muốn thêm đã ở trong nhóm rồi"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<CheckMessageExistedResponse> CheckMessageExisted(CheckMessageExistedRequest request)
        {
            var result = await conversationRepository.CheckMessageExisted(request);
            return result;
        }

        public async Task<Guid?> CreateGroup(CreateGroupRequest request, Guid creatorId)
        {
            var (result, message) = await conversationRepository.CreateGroup(request, creatorId);
            return message switch
            {
                "NOT_ENOUGH_MEMBERS" => throw new BadRequestException("Không đủ thành viên cho một nhóm"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<GetMessageResponse> GetMessage(BaseRequestSecond request, Guid conversationId, Guid userId)
        {
            var (result, message) = await conversationRepository.GetMessage(request, conversationId, userId);
            return message switch
            {
                "NOT_IN_CONVERSATION" => throw new NotFoundException("Bạn không ở trong cuộc hội thoại này"),
                "NOT_FOUND_CONVERSATION" => throw new NotFoundException("Không tìm thấy cuộc hội thoại này"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<PagedResponse<ConversationResponse>> GetMyConversation(GetConversationFilterRequest request, Guid userId)
        {
            var result = await conversationRepository.GetMyConversation(request, userId);
            return result;
        }

        public async Task<bool> LeaveGroup(Guid conversationId, Guid userId)
        {
            var (result, message) = await conversationRepository.LeaveGroup(conversationId, userId);
            return message switch
            {
                "NOT_FOUND_GROUP" => throw new NotFoundException("Không tìm thấy nhóm"),
                "NOT_IN_GROUP" => throw new ForbiddenException("Bạn không có trong nhóm này"),
                "SUCCESS" => result,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<Guid?> SendMessage(SendMessageRequest request, Guid SenderId)
        {
            var (result, message) = await conversationRepository.SendMessage(request, SenderId);
            return message switch
            {
                "SUCCESS" => result,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<ConversationResponse?> UpdateConversation(UpdateGroupRequest request, Guid conversationId, Guid senderId)
        {
            var (result, message) = await conversationRepository.UpdateConversation(request, conversationId, senderId);
            return message switch
            {
                "NOT_FOUND_CONVERSATION" => throw new NotFoundException("Không tìm thấy cuộc trò chuyện"),
                "BIGGER_THAN_2MB" => throw new BadRequestException("Ảnh đại diện phải có kích thước nhỏ hơn 2MB"),
                "UPLOAD_TO_CLOUDINARY_FAILED" => throw new Exception("Upload ảnh đại diện thất bại"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }
    }
}
