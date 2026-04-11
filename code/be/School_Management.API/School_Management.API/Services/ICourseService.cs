using School_Management.API.Models.DTO;
using System.Security.Cryptography.X509Certificates;

namespace School_Management.API.Services
{
    public interface ICourseService
    {
        public Task<CourseResponse> CreateCourse(CreateCourseRequest request, Guid userId);
        public Task<CourseResponse> UpdateCourse(CreateCourseRequest request, Guid courseId, Guid userId);
    }
}
