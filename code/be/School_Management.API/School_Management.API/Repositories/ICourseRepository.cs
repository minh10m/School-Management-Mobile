using School_Management.API.Models.DTO;
using System.Security.Claims;

namespace School_Management.API.Repositories
{
    public interface ICourseRepository
    {
        public Task<(CourseResponse? data, string? message)> CreateCourse(CreateCourseRequest request, Guid userId);
        public Task<(CourseResponse? data, string? message)> UpdateCourse(CreateCourseRequest request, Guid courseId, Guid userId);
        public Task<(PagedResponse<CourseResponse>? data, string? message)> GetMyCourseForTeacher(MyCourseFilterRequest request, Guid userId);
        public Task<(CourseResponse? data, string? message)> GetCourseById(Guid courseId);
        public Task<(CourseResponse? data, string? message)> ReviseCourseForAdmin(Guid courseId, UpdateStatusCourseRequest request);
        public Task<PagedResponse<CourseResponse>> GetAllCourseForAdmin(CourseFilterRequestAdmin request);
        public Task<PagedResponse<CourseResponse>> GetAllCourseForTeacherAndStudent(CourseFilterRequestTeacherAndStudent request);
        public Task<(PagedResponse<CourseResponse>? data, string message)> GetMyCourseForStudent(MyCourseFilterRequest request, Guid userId);

    }
}
