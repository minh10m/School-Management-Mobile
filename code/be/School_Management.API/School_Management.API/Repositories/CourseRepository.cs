using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class CourseRepository : ICourseRepository
    {
        private readonly ApplicationDbContext context;

        public CourseRepository(ApplicationDbContext context)
        {
            this.context = context;
        }
        public async Task<(CourseResponse? data, string? message)> CreateCourse(CreateCourseRequest request, Guid userId)
        {
            var teacherId = await context.Teacher.AsNoTracking().Where(x => x.UserId == userId)
                                                                .Select(g => g.Id)
                                                                .FirstOrDefaultAsync();

            if (teacherId == Guid.Empty) return (null, "NOT_FOUND_TEACHER");
            var teacherSubjectInfo = await context.TeacherSubject.AsNoTracking()
                                                                              .Where(x => x.TeacherId == teacherId && x.SubjectId == request.SubjectId)
                                                                              .Select(g => new { g.TeacherSubjectId, g.Teacher.User.FullName, g.Subject.SubjectName })
                                                                              .FirstOrDefaultAsync();
            if (teacherSubjectInfo == null) return (null, "NOT_FOUND_TEACHERSUBJECTID");

            var isExisted = await context.Course.AnyAsync(x => x.CourseName.Trim() == request.CourseName.Trim() && x.TeacherSubject.TeacherId == teacherId);
            if (isExisted) return (null, "DUPLICATED_COURSENAME");

            if (request.Price < 0) return (null, "UNCORRECT_PRICE");

            var course = new Course
            {
                Id = Guid.NewGuid(),
                TeacherSubjectId = teacherSubjectInfo.TeacherSubjectId,
                CourseName = request.CourseName,
                Description = request.Description,
                CreatedAt = DateTimeOffset.UtcNow,
                PublishedAt = null,
                Price = request.Price,
                Status = "Pending"
            };

            context.Course.Add(course);
            await context.SaveChangesAsync();

            return (new CourseResponse
            {
                Id = course.Id,
                Description = course.Description,
                CourseName = course.CourseName,
                CreatedAt = course.CreatedAt,
                Price = course.Price,
                Status = course.Status,
                PublishedAt = course.PublishedAt,
                SubjectName = teacherSubjectInfo.SubjectName,
                TeacherSubjectId = course.TeacherSubjectId,
                TeacherName = teacherSubjectInfo.FullName
            }, "SUCCESS");
        }
    }
}
