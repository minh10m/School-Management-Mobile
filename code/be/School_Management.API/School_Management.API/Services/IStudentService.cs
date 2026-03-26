using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using System.Security.Claims;

namespace School_Management.API.Services
{
    public interface IStudentService
    {
        public Task<PagedResponse<StudentListResponse>> GetAllStudent(StudentFilterRequest request);
        public Task<StudentInfoResponse> GetStudentById(Guid studentId);
        public Task<StudentInfoResponse> GetMyProfileForStudent(Guid userId);
        public Task<StudentInfoResponse> UpdateStudentByAdminOrTeacher(UpdateUserRequest updateUserRequest, Guid studentId, ClaimsPrincipal currentUser);
        public Task<StudentInfoResponse> UpdateMyProfileForStudent(UpdateUserRequest updateUserRequest, Guid userId);
        public Task<StudentInfoResponse> ChangeClassForStudent(ChangeClassRequest changeClassRequest, Guid studentId);
    }
}
