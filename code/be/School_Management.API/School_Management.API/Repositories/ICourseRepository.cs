using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface ICourseRepository
    {
        public Task<(CourseResponse? data, string? message)> CreateCourse(CreateCourseRequest request, Guid userId);

    }
}
