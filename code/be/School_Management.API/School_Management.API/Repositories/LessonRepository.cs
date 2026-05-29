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
                var course = await context.Course.FirstOrDefaultAsync(x => x.Id == request.CourseId);
                if (course == null) return (null, "NOT_FOUND_COURSE");

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
            var query = context.Lesson.AsNoTracking().Include(x => x.Course).Include(x => x.LessonVideos).AsQueryable();
            query = query.Where(x => x.CourseId == request.CourseId);

            query = query.OrderBy(x => x.OrderIndex);

            var totalCount = await query.CountAsync();
            var skipsResult = (request.PageNumber - 1) * request.PageSize;
            var listResult = await query.Skip(skipsResult).Take(request.PageSize)
                                        .Select(lesson => new LessonResponse
                                        {
                                            Id = lesson.Id,
                                            CourseId = lesson.CourseId,
                                            CourseName = lesson.Course.CourseName,
                                            LessonName = lesson.LessonName,
                                            OrderIndex = lesson.OrderIndex,
                                            LessonVideos = lesson.LessonVideos.Select(v => new LessonVideoResponse
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
            var lesson = await context.Lesson.Include(x => x.Course).Include(x => x.LessonVideos).FirstOrDefaultAsync(x => x.Id == lessonId);
            if (lesson == null) return (null, "NOT_FOUND_LESSON");

            var result = new LessonResponse
            {
                Id = lesson.Id,
                CourseId = lesson.CourseId,
                CourseName = lesson.Course.CourseName,
                LessonName = lesson.LessonName,
                OrderIndex = lesson.OrderIndex,
                LessonVideos = lesson.LessonVideos.Select(v => new LessonVideoResponse
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
            };

            return (result, "SUCCESS");

        }

        public async Task<(bool result, string message)> HardDeleteLesson(Guid lessonId, Guid userId)
        {
            // 1. Kiểm tra quyền Giáo viên
            var teacher = await context.Teacher.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId);
            if (teacher == null) return (false, "NOT_FOUND_TEACHER");

            // 2. Tìm bài học cần xóa
            var lesson = await context.Lesson
                .Include(l => l.Course)
                    .ThenInclude(c => c.TeacherSubject)
                .FirstOrDefaultAsync(l => l.Id == lessonId);

            if (lesson == null) return (false, "NOT_FOUND_LESSON");

            // 3. Xác thực quyền sở hữu khóa học
            if (lesson.Course.TeacherSubject == null || lesson.Course.TeacherSubject.TeacherId != teacher.Id)
                return (false, "NOT_IS_TEACHER_OF_COURSE");

            // Lưu lại thông tin cần thiết trước khi thực hiện thay đổi cấu trúc dữ liệu
            var targetCourseId = lesson.CourseId;
            var deletedOrderIndex = lesson.OrderIndex;

            // 4. Khởi động Transaction để bảo vệ chuỗi thao tác liên hoàn
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                // Bước A: Thực hiện xóa cứng bản ghi bài học mục tiêu
                context.Lesson.Remove(lesson);
                await context.SaveChangesAsync();

                // Bước B: Dồn dịch chỉ số - Giảm toàn bộ OrderIndex của các bài phía sau đi 1 đơn vị
                // Sử dụng ExecuteUpdateAsync để cập nhật trực tiếp dưới Database mà không cần nạp dữ liệu lên RAM
                await context.Lesson
                    .Where(x => x.CourseId == targetCourseId && x.OrderIndex > deletedOrderIndex)
                    .ExecuteUpdateAsync(s => s.SetProperty(l => l.OrderIndex, l => l.OrderIndex - 1));

                // Xác nhận hoàn tất thành công
                await transaction.CommitAsync();
                return (true, "SUCCESS");
            }
            catch (Exception ex)
            {
                // Quay xe nếu một trong hai bước trên gặp sự cố sập nguồn/lỗi DB
                await transaction.RollbackAsync();
                // Giả định bạn có biến logger được khai báo ở tầng class
                // logger.LogError(ex, "Lỗi xảy ra khi dồn chỉ số lúc xóa Lesson {Id}", lessonId);
                return (false, "EXCEPTION_ERROR");
            }
        }

        public async Task<(LessonResponse? data, string? message)> UpdateLesson(UpdateLessonRequest request, Guid lessonId)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var lesson = await context.Lesson.Include(x => x.Course).Include(x => x.LessonVideos).FirstOrDefaultAsync(x => x.Id == lessonId);
                if (lesson == null) return (null, "NOT_FOUND_LESSON");

                if (request.OrderIndex > lesson.OrderIndex)
                {
                    await context.Lesson.Where(x => x.CourseId == lesson.CourseId && x.OrderIndex > lesson.OrderIndex && x.OrderIndex <= request.OrderIndex)
                                        .ExecuteUpdateAsync(s => s.SetProperty(l => l.OrderIndex, l => l.OrderIndex - 1));
                }
                else if (request.OrderIndex < lesson.OrderIndex)
                {
                    await context.Lesson.Where(x => x.CourseId == lesson.CourseId && x.OrderIndex < lesson.OrderIndex && x.OrderIndex >= request.OrderIndex)
                                        .ExecuteUpdateAsync(s => s.SetProperty(l => l.OrderIndex, l => l.OrderIndex + 1));
                }
                lesson.LessonName = request.LessonName;
                lesson.OrderIndex = request.OrderIndex;

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                var result = new LessonResponse
                {
                    Id = lesson.Id,
                    CourseId = lesson.CourseId,
                    CourseName = lesson.Course.CourseName,
                    LessonName= lesson.LessonName,
                    OrderIndex = lesson.OrderIndex,
                    LessonVideos = lesson.LessonVideos.Select(v => new LessonVideoResponse
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
