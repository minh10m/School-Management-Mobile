using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Exceptions;
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
                // IgnoreQueryFilters để tìm được course dù bị soft delete
                var course = await context.Course.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == request.CourseId);
                if (course == null) return (null, "NOT_FOUND_COURSE");

                var maxOrder = await context.Lesson
                                    .Where(x => x.CourseId == request.CourseId)
                                    .MaxAsync(x => (int?)x.OrderIndex) ?? 0;

                if (request.OrderIndex > maxOrder + 1)
                {
                    request.OrderIndex = maxOrder + 1;
                }

                await context.Lesson
                    .Where(x => x.CourseId == request.CourseId && x.OrderIndex >= request.OrderIndex)
                    .ExecuteUpdateAsync(s => s.SetProperty(l => l.OrderIndex, l => l.OrderIndex + 1));

                var newLesson = new Lesson
                {
                    Id = Guid.NewGuid(),
                    CourseId = request.CourseId,
                    LessonName = request.LessonName,
                    OrderIndex = request.OrderIndex
                };

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

        public async Task<(PagedResponse<LessonResponse>? data, string? message)> GetAllLessonOfCourse(LessonFilterRequest request)
        {
            var course = await context.Course.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == request.CourseId);
            if (course == null) return (null, "NOT_FOUND_COURSE");

            // IgnoreQueryFilters + dùng projection (.Select) thay vì .Include
            // để tránh global query filter của Course chặn navigation property
            var query = context.Lesson
                .IgnoreQueryFilters()
                .AsNoTracking()
                .Where(x => x.CourseId == request.CourseId)
                .OrderBy(x => x.OrderIndex);

            var totalCount = await query.CountAsync();
            var skipsResult = (request.PageNumber - 1) * request.PageSize;

            var listResult = await query
                .Skip(skipsResult)
                .Take(request.PageSize)
                .Select(lesson => new LessonResponse
                {
                    Id = lesson.Id,
                    CourseId = lesson.CourseId,
                    CourseName = lesson.Course.CourseName,
                    LessonName = lesson.LessonName,
                    OrderIndex = lesson.OrderIndex,
                    LessonVideos = lesson.LessonVideos
                        .OrderBy(v => v.OrderIndex)
                        .Select(v => new LessonVideoResponse
                        {
                            Id = v.Id,
                            LessonId = v.LessonId,
                            LessonName = lesson.LessonName,
                            Url = v.Url,
                            Name = v.Name,
                            Duration = v.Duration,
                            OrderIndex = v.OrderIndex,
                            IsPreview = v.IsPreview
                        }).ToList()
                }).ToListAsync();

            return (new PagedResponse<LessonResponse>
            {
                Items = listResult,
                PageSize = request.PageSize,
                PageNumber = request.PageNumber,
                TotalCount = totalCount
            }, "SUCCESS");
        }

        public async Task<(LessonResponse? data, string message)> GetLessonById(Guid lessonId)
        {
            // Dùng projection thay .Include để tránh bị filter của Course chặn
            var result = await context.Lesson
                .IgnoreQueryFilters()
                .AsNoTracking()
                .Where(x => x.Id == lessonId)
                .Select(lesson => new LessonResponse
                {
                    Id = lesson.Id,
                    CourseId = lesson.CourseId,
                    CourseName = lesson.Course.CourseName,
                    LessonName = lesson.LessonName,
                    OrderIndex = lesson.OrderIndex,
                    LessonVideos = lesson.LessonVideos
                        .OrderBy(v => v.OrderIndex)
                        .Select(v => new LessonVideoResponse
                        {
                            Id = v.Id,
                            LessonId = v.LessonId,
                            LessonName = lesson.LessonName,
                            Url = v.Url,
                            Name = v.Name,
                            Duration = v.Duration,
                            OrderIndex = v.OrderIndex,
                            IsPreview = v.IsPreview
                        }).ToList()
                })
                .FirstOrDefaultAsync();

            if (result == null) return (null, "NOT_FOUND_LESSON");
            return (result, "SUCCESS");
        }

        public async Task<(bool result, string message)> HardDeleteLesson(Guid lessonId, Guid userId)
        {
            var teacher = await context.Teacher.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId);
            if (teacher == null) return (false, "NOT_FOUND_TEACHER");

            var lesson = await context.Lesson
                .IgnoreQueryFilters()
                .Include(l => l.Course)
                    .ThenInclude(c => c.TeacherSubject)
                .FirstOrDefaultAsync(l => l.Id == lessonId);

            if (lesson == null) return (false, "NOT_FOUND_LESSON");

            if (lesson.Course.TeacherSubject == null || lesson.Course.TeacherSubject.TeacherId != teacher.Id)
                return (false, "NOT_IS_TEACHER_OF_COURSE");

            var targetCourseId = lesson.CourseId;
            var deletedOrderIndex = lesson.OrderIndex;

            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                context.Lesson.Remove(lesson);
                await context.SaveChangesAsync();

                await context.Lesson
                    .Where(x => x.CourseId == targetCourseId && x.OrderIndex > deletedOrderIndex)
                    .ExecuteUpdateAsync(s => s.SetProperty(l => l.OrderIndex, l => l.OrderIndex - 1));

                await transaction.CommitAsync();
                return (true, "SUCCESS");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return (false, "EXCEPTION_ERROR");
            }
        }

        public async Task<(LessonResponse? data, string? message)> UpdateLesson(UpdateLessonRequest request, Guid lessonId)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var lesson = await context.Lesson
                    .IgnoreQueryFilters()
                    .Include(x => x.LessonVideos)
                    .FirstOrDefaultAsync(x => x.Id == lessonId);

                if (lesson == null) return (null, "NOT_FOUND_LESSON");

                if (request.OrderIndex > lesson.OrderIndex)
                {
                    await context.Lesson
                        .Where(x => x.CourseId == lesson.CourseId && x.OrderIndex > lesson.OrderIndex && x.OrderIndex <= request.OrderIndex)
                        .ExecuteUpdateAsync(s => s.SetProperty(l => l.OrderIndex, l => l.OrderIndex - 1));
                }
                else if (request.OrderIndex < lesson.OrderIndex)
                {
                    await context.Lesson
                        .Where(x => x.CourseId == lesson.CourseId && x.OrderIndex < lesson.OrderIndex && x.OrderIndex >= request.OrderIndex)
                        .ExecuteUpdateAsync(s => s.SetProperty(l => l.OrderIndex, l => l.OrderIndex + 1));
                }

                lesson.LessonName = request.LessonName;
                lesson.OrderIndex = request.OrderIndex;

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Dùng projection để lấy CourseName tránh bị filter Course chặn
                var courseName = await context.Course
                    .IgnoreQueryFilters()
                    .AsNoTracking()
                    .Where(x => x.Id == lesson.CourseId)
                    .Select(x => x.CourseName)
                    .FirstOrDefaultAsync();

                return (new LessonResponse
                {
                    Id = lesson.Id,
                    CourseId = lesson.CourseId,
                    CourseName = courseName ?? string.Empty,
                    LessonName = lesson.LessonName,
                    OrderIndex = lesson.OrderIndex,
                    LessonVideos = lesson.LessonVideos
                        .OrderBy(v => v.OrderIndex)
                        .Select(v => new LessonVideoResponse
                        {
                            Id = v.Id,
                            LessonId = v.LessonId,
                            LessonName = lesson.LessonName,
                            Url = v.Url,
                            Name = v.Name,
                            Duration = v.Duration,
                            OrderIndex = v.OrderIndex,
                            IsPreview = v.IsPreview
                        }).ToList()
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