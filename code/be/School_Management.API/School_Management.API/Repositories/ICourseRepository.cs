using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface ICourseRepository
    {
        public Task<(CourseResponse? data, string? message)> CreateCourse(CreateCourseRequest request, Guid userId);
        public Task<(CourseResponse? data, string? message)> UpdateCourse(CreateCourseRequest request, Guid courseId, Guid userId);
        public Task<(PagedResponse<CourseResponse>? data, string? message)> GetMyCourseForTeacher(MyCourseFilterRequest request, Guid userId);
        public Task<(CourseResponse? data, string? message)> GetCourseById(Guid courseId);
        public Task<(CourseResponse? data, string? message)> ReviseCourseForAdmin(Guid courseId, UpdateStatusCourseRequest request);


    }
}
