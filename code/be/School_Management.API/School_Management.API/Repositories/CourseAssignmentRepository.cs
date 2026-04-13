using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class CourseAssignmentRepository : ICourseAssignmentRepository
    {
        private readonly ApplicationDbContext context;

        public CourseAssignmentRepository(ApplicationDbContext context)
        {
            this.context = context;
        }
        public async Task<(CourseAssignmentResponse? data, string message)> CreateCourseAssignment(CourseAssignmentRequest request)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var lesson = await context.Lesson.AsNoTracking().Where(x => x.Id == request.LessonId)
                                                            .Select(g => new { g.Id, g.LessonName })
                                                            .FirstOrDefaultAsync();
                if (lesson == null) return (null, "NOT_FOUND_LESSON");

                var isExisted = await context.CourseAssignment.AnyAsync(x => x.LessonId == request.LessonId && x.Title.Trim().ToLower() == request.Title.Trim().ToLower());
                if (isExisted) return (null, "CONFLICT_TITLE");

                var maxOrder = await context.CourseAssignment.Where(x => x.LessonId == request.LessonId)
                                                             .MaxAsync(x => (int?)x.OrderIndex) ?? 0;

                if (request.OrderIndex > maxOrder + 1)
                    request.OrderIndex = maxOrder + 1;

                await context.CourseAssignment.Where(x => x.LessonId == request.LessonId && x.OrderIndex >= request.OrderIndex)
                                              .ExecuteUpdateAsync(g => g.SetProperty(l => l.OrderIndex, l => l.OrderIndex + 1));

                var courseAssignment = new CourseAssignment
                {
                    Id = Guid.NewGuid(),
                    FileTitle = request.FileTitle ?? "Không có dữ liệu",
                    FileUrl = request.FileUrl ?? "Không có dữ liệu", 
                    LessonId = request.LessonId,
                    OrderIndex = request.OrderIndex,
                    Title = request.Title
                };

                context.CourseAssignment.Add(courseAssignment);
                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                var result = new CourseAssignmentResponse
                {
                    Id = courseAssignment.Id,
                    FileTitle = courseAssignment.FileTitle,
                    FileUrl = courseAssignment.FileUrl,
                    LessonId = courseAssignment.LessonId,
                    LessonName = lesson.LessonName,
                    OrderIndex = courseAssignment.OrderIndex,
                    Title = courseAssignment.Title
                };

                return (result, "SUCCESS");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
            
        }

        public async Task<(CourseAssignmentResponse? data, string mesaage)> UpdateCourseAssignment(UpdateCourseAssignmentRequest request, Guid courseAssignmentId)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var courseAssignment = await context.CourseAssignment.Include(x => x.Lesson).FirstOrDefaultAsync(x => x.Id == courseAssignmentId);
                if (courseAssignment == null) return (null, "NOT_FOUND_COURSE_ASSIGNMENT");

                var isExisted = await context.CourseAssignment.AnyAsync(x => x.LessonId == courseAssignment.LessonId && x.Id != courseAssignmentId
                                                                          && x.Title.Trim().ToLower() == request.Title.Trim().ToLower());
                if (isExisted) return (null, "CONFLICT_TITLE");

                if (request.OrderIndex > courseAssignment.OrderIndex)
                    await context.CourseAssignment.Where(x => x.LessonId == courseAssignment.LessonId && x.OrderIndex > courseAssignment.OrderIndex
                                                           && x.OrderIndex <= request.OrderIndex)
                                                  .ExecuteUpdateAsync(g => g.SetProperty(l => l.OrderIndex, l => l.OrderIndex - 1));

                else if(request.OrderIndex < courseAssignment.OrderIndex)
                    await context.CourseAssignment.Where(x => x.LessonId == courseAssignment.LessonId && x.OrderIndex < courseAssignment.OrderIndex
                                                           && x.OrderIndex >= request.OrderIndex)
                                                  .ExecuteUpdateAsync(g => g.SetProperty(l => l.OrderIndex, l => l.OrderIndex + 1));

                courseAssignment.FileTitle = request.FileTitle ?? "Không có dữ liệu";
                courseAssignment.FileUrl = request.FileUrl ?? "Không có dữ liệu";
                courseAssignment.OrderIndex = request.OrderIndex;
                courseAssignment.Title = request.Title;

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                var result = new CourseAssignmentResponse
                {
                    Id = courseAssignment.Id,
                    FileTitle = courseAssignment.FileTitle,
                    FileUrl = courseAssignment.FileUrl,
                    LessonId = courseAssignment.LessonId,
                    LessonName = courseAssignment.Lesson.LessonName,
                    OrderIndex = courseAssignment.OrderIndex,
                    Title = courseAssignment.Title
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
