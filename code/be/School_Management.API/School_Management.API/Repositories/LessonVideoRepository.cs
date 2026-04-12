using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class LessonVideoRepository : ILessonVideoRepository
    {
        private readonly ApplicationDbContext context;

        public LessonVideoRepository(ApplicationDbContext context)
        {
            this.context = context;
        }
        public async Task<(LessonVideoResponse? data, string message)> CreateLessonVideo(LessonVideoRequest request)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var lesson = await context.Lesson.AsNoTracking().FirstOrDefaultAsync(x => x.Id == request.LessonId);
                if (lesson == null) return (null, "NOT_FOUND_LESSON");

                var maxOrder = await context.LessonVideo
                                    .Where(x => x.LessonId == request.LessonId)
                                    .MaxAsync(x => (int?)x.OrderIndex) ?? 0;

                if (request.OrderIndex > maxOrder + 1)
                {
                    request.OrderIndex = maxOrder + 1;
                }
                await context.LessonVideo.Where(x => x.LessonId == request.LessonId && x.OrderIndex >= request.OrderIndex)
                                         .ExecuteUpdateAsync(g => g.SetProperty(l => l.OrderIndex, l => l.OrderIndex + 1));


                var lessonVideo = new LessonVideo
                {
                    Id = Guid.NewGuid(),
                    Duration = request.Duration,
                    IsPreview = request.IsPreview,
                    LessonId = request.LessonId,
                    Name = request.Name,
                    OrderIndex = request.OrderIndex,
                    Url = request.Url
                };

                context.LessonVideo.Add(lessonVideo);
                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                var result = new LessonVideoResponse
                {
                    Id = lessonVideo.Id,
                    Duration = lessonVideo.Duration,
                    IsPreview = lessonVideo.IsPreview,
                    LessonId = lessonVideo.LessonId,
                    LessonName = lesson.LessonName,
                    Name = lessonVideo.Name,
                    OrderIndex = lessonVideo.OrderIndex,
                    Url = lessonVideo.Url
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
