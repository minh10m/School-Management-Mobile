using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class LessonRepository : ILessonRepository
    {
        private readonly ApplicationDbContext context;

        public LessonRepository(ApplicationDbContext context)
        {
            this.context = context;
        }
        public async Task<(LessonResponse? data, string? message)> CreateLesson(LessonRequest request)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {

                var maxOrder = await context.Lesson
                                    .Where(x => x.CourseId == request.CourseId)
                                    .MaxAsync(x => (int?)x.OrderIndex) ?? 0;

                if (request.OrderIndex > maxOrder + 1)
                {
                    request.OrderIndex = maxOrder + 1;
                }
                await context.Lesson.Where(x => x.CourseId == request.CourseId && x.OrderIndex >= request.OrderIndex)
                                    .ExecuteUpdateAsync(s => s.SetProperty(l => l.OrderIndex, l => l.OrderIndex + 1));

                var newLesson = new Lesson
                {
                    Id = Guid.NewGuid(),
                    CourseId = request.CourseId,
                    LessonName = request.LessonName,
                    OrderIndex = request.OrderIndex
                };

                var course = await context.Course.FirstOrDefaultAsync(x => x.Id == request.CourseId);
                if (course == null) return (null, "NOT_FOUND_COURSE");

                context.Lesson.Add(newLesson);
                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                return (new LessonResponse
                {
                    Id = newLesson.Id,
                    CourseId = newLesson.CourseId,
                    CourseName = course.CourseName,
                    LessonName = newLesson.LessonName,
                    OrderIndex = newLesson.OrderIndex
                }, "SUCCESS");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
