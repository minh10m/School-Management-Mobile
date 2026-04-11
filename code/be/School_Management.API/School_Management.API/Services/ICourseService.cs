using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface ICourseService
    {
        public Task<CourseResponse> CreateCourse(CreateCourseRequest request, Guid userId);
    }
}
