using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface ITeacherService
    {
        public Task<PagedResponse<TeacherListResponse>> GetAllTeacher(TeacherFilterRequest request);
        public Task<TeacherInfoResponse> GetTeacherById(Guid teacherId);
        public Task<TeacherInfoResponse> GetMyProfileForTeacher(Guid userId);
        public Task<TeacherInfoResponse> UpdateTeacherForAdmin(UpdateUserRequest updateUserRequest, Guid teacherId);
        public Task<TeacherInfoResponse> UpdateMyProfileForTeacher(UpdateUserRequest updateUserRequest, Guid userId);

    }
}
