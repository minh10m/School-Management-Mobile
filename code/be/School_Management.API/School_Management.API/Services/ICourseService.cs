using School_Management.API.Models.DTO;
using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;

namespace School_Management.API.Services
{
    public interface ICourseService
    {
        public Task<CourseResponse> CreateCourse(CreateCourseRequest request, Guid userId);
        public Task<CourseResponse> UpdateCourse(CreateCourseRequest request, Guid courseId, Guid userId);
        public Task<PagedResponse<CourseResponse>> GetMyCourseForTeacher(MyCourseFilterRequest request, Guid userId);
        public Task<PagedResponse<CourseResponse>> GetMyCourseForStudent(MyCourseFilterRequest request, Guid userId);
        public Task<CourseResponse> GetCourseById(Guid courseId);
        public Task<CourseResponse> ReviseCourseForAdmin(Guid courseId, UpdateStatusCourseRequest request);
        public Task<PagedResponse<CourseResponse>> GetAllCourseForAdmin(CourseFilterRequestAdmin request);
        public Task<PagedResponse<CourseResponse>> GetAllCourseForTeacherAndStudent(CourseFilterRequestTeacherAndStudent request);
    }
}
