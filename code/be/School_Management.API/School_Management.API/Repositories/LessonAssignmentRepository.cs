using CloudinaryDotNet.Actions;
using CloudinaryDotNet;
using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class LessonAssignmentRepository : ILessonAssignmentRepository
    {
        private readonly ApplicationDbContext context;
        private readonly Cloudinary cloudinary;

        public LessonAssignmentRepository(ApplicationDbContext context, Cloudinary cloudinary)
        {
            this.context = context;
            this.cloudinary = cloudinary;
        }
        public async Task<(LessonAssignmentResponse? data, string message)> CreateLessonAssignment(LessonAssignmentRequest request)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var lesson = await context.Lesson.AsNoTracking().Where(x => x.Id == request.LessonId)
                                                            .Select(g => new { g.Id, g.LessonName })
                                                            .FirstOrDefaultAsync();
                if (lesson == null) return (null, "NOT_FOUND_LESSON");

                var isExisted = await context.LessonAssignment.AnyAsync(x => x.LessonId == request.LessonId && x.Title.Trim().ToLower() == request.Title.Trim().ToLower());
                if (isExisted) return (null, "CONFLICT_TITLE");

                var maxOrder = await context.LessonAssignment.Where(x => x.LessonId == request.LessonId)
                                                             .MaxAsync(x => (int?)x.OrderIndex) ?? 0;

                if (request.OrderIndex > maxOrder + 1)
                    request.OrderIndex = maxOrder + 1;

                await context.LessonAssignment.Where(x => x.LessonId == request.LessonId && x.OrderIndex >= request.OrderIndex)
                                              .ExecuteUpdateAsync(g => g.SetProperty(l => l.OrderIndex, l => l.OrderIndex + 1));

                string fileUrl = "Không có dữ liệu";
                string? fileTitle = request.FileTitle?.Trim() ?? null;
                string? publicId = null;

                if (request.File != null && request.File.Length > 0)
                {
                    using var stream = request.File.OpenReadStream();
                    var uploadParams = new RawUploadParams
                    {
                        File = new FileDescription(request.File.FileName, stream),
                        Folder = "assignments",
                        PublicId = Guid.NewGuid().ToString(),
                        Type = "upload",
                        AccessMode = "public"
                    };
                    var uploadResult = await cloudinary.UploadAsync(uploadParams);
                    if (uploadResult.Error != null) return (null, "UPLOAD_FILE_FAILED");

                    fileUrl = uploadResult.SecureUrl.ToString();
                    if (string.IsNullOrEmpty(fileTitle)) fileTitle = request.File.FileName;
                    publicId = uploadResult.PublicId;

                }

                var lessonAssignment = new LessonAssignment
                {
                    Id = Guid.NewGuid(),
                    FileTitle = fileTitle,
                    FileUrl = fileUrl,
                    LessonId = request.LessonId,
                    OrderIndex = request.OrderIndex,
                    PublicId = publicId,
                    Title = request.Title
                };

                context.LessonAssignment.Add(lessonAssignment);
                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                var result = new LessonAssignmentResponse
                {
                    Id = lessonAssignment.Id,
                    FileTitle = lessonAssignment.FileTitle,
                    FileUrl = lessonAssignment.FileUrl,
                    LessonId = lessonAssignment.LessonId,
                    LessonName = lesson.LessonName,
                    OrderIndex = lessonAssignment.OrderIndex,
                    Title = lessonAssignment.Title
                };

                return (result, "SUCCESS");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
            
        }

        public async Task<(PagedResponse<LessonAssignmentResponse>? data, string message)> GetAllLessonAssignment(LessonAssignmentFilterRequest request)
        {
            var lesson = await context.Lesson.AsNoTracking().Where(x => x.Id == request.LessonId).Select(g => new { g.Id, g.LessonName }).FirstOrDefaultAsync();
            if (lesson == null) return (null, "NOT_FOUND_LESSON");

            var query = context.LessonAssignment.AsNoTracking().AsQueryable();
            query = query.Where(x => x.LessonId == request.LessonId);
            query = query.OrderBy(x => x.OrderIndex);

            var totalCount = await query.CountAsync();
            var skipsResult = (request.PageNumber - 1) * request.PageSize;
            var listResult = await query.Skip(skipsResult).Take(request.PageSize)
                                        .Select(lessonAssignment => new LessonAssignmentResponse
                                        {
                                            Id = lessonAssignment.Id,
                                            FileTitle = lessonAssignment.FileTitle,
                                            FileUrl = lessonAssignment.FileUrl,
                                            LessonId = lessonAssignment.LessonId,
                                            LessonName = lesson.LessonName,
                                            OrderIndex = lessonAssignment.OrderIndex,
                                            Title = lessonAssignment.Title
                                        }).ToListAsync();

            return (new PagedResponse<LessonAssignmentResponse>
            {
                Items = listResult,
                PageSize = request.PageSize,
                PageNumber = request.PageNumber,
                TotalCount = totalCount
            }, "SUCCESS");
        }

        public async Task<(LessonAssignmentResponse? data, string message)> GetLessonAssignmentById(Guid lessonAssignmentId)
        {
            var lessonAssignment = await context.LessonAssignment.Include(x => x.Lesson).FirstOrDefaultAsync(x => x.Id == lessonAssignmentId);
            if (lessonAssignment == null) return (null, "NOT_FOUND_COURSE_ASSIGNMENT");

            var result = new LessonAssignmentResponse
            {
                Id = lessonAssignment.Id,
                FileTitle = lessonAssignment.FileTitle,
                FileUrl = lessonAssignment.FileUrl,
                LessonId = lessonAssignment.LessonId,
                LessonName = lessonAssignment.Lesson.LessonName,
                OrderIndex = lessonAssignment.OrderIndex,
                Title = lessonAssignment.Title
            };

            return (result, "SUCCESS");
        }

        public async Task<(LessonAssignmentResponse? data, string mesaage)> UpdateLessonAssignment(UpdateLessonAssignmentRequest request, Guid lessonAssignmentId)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var lessonAssignment = await context.LessonAssignment.Include(x => x.Lesson).FirstOrDefaultAsync(x => x.Id == lessonAssignmentId);
                if (lessonAssignment == null) return (null, "NOT_FOUND_COURSE_ASSIGNMENT");

                var isExisted = await context.LessonAssignment.AnyAsync(x => x.LessonId == lessonAssignment.LessonId && x.Id != lessonAssignmentId
                                                                          && x.Title.Trim().ToLower() == request.Title.Trim().ToLower());
                if (isExisted) return (null, "CONFLICT_TITLE");

                if (request.OrderIndex > lessonAssignment.OrderIndex)
                    await context.LessonAssignment.Where(x => x.LessonId == lessonAssignment.LessonId && x.OrderIndex > lessonAssignment.OrderIndex
                                                           && x.OrderIndex <= request.OrderIndex)
                                                  .ExecuteUpdateAsync(g => g.SetProperty(l => l.OrderIndex, l => l.OrderIndex - 1));

                else if(request.OrderIndex < lessonAssignment.OrderIndex)
                    await context.LessonAssignment.Where(x => x.LessonId == lessonAssignment.LessonId && x.OrderIndex < lessonAssignment.OrderIndex
                                                           && x.OrderIndex >= request.OrderIndex)
                                                  .ExecuteUpdateAsync(g => g.SetProperty(l => l.OrderIndex, l => l.OrderIndex + 1));

                lessonAssignment.FileTitle = request.FileTitle ?? "Không có dữ liệu";
                lessonAssignment.FileUrl = request.FileUrl ?? "Không có dữ liệu";
                lessonAssignment.OrderIndex = request.OrderIndex;
                lessonAssignment.Title = request.Title;

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                var result = new LessonAssignmentResponse
                {
                    Id = lessonAssignment.Id,
                    FileTitle = lessonAssignment.FileTitle,
                    FileUrl = lessonAssignment.FileUrl,
                    LessonId = lessonAssignment.LessonId,
                    LessonName = lessonAssignment.Lesson.LessonName,
                    OrderIndex = lessonAssignment.OrderIndex,
                    Title = lessonAssignment.Title
                };

                return (result, "SUCCESS");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
