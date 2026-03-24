using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface ITeacherService
    {
        public Task<PagedResponse<TeacherListResponse>> GetAllTeacher(string? filterOn, string? filterQuery, string? sortBy, bool isAscending, int pageNumber, int pageSize);
        public Task<TeacherInfoResponse> GetTeacherById(Guid teacherId);
        public Task<TeacherInfoResponse> GetMyProfileForTeacher(Guid userId);
    }
}
