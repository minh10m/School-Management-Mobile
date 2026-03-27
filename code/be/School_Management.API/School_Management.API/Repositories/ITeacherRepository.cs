using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface ITeacherRepository
    {
        public Task<PagedResponse<TeacherListResponse>> GetAllTeacher(TeacherFilterRequest request);
        public Task<TeacherInfoResponse> GetTeacherById(Guid teacherId);
        public Task<TeacherInfoResponse> GetMyProfileForTeacher(Guid userId);
        public Task<Guid> GetUserIdByTeacherid(Guid teacherId);

        public Task<TeacherInfoResponse> ReturnData(AppUser user, Guid teacherId);
        public Task<Guid> GetTeacherIdByUserId(Guid userId);
    }
}
