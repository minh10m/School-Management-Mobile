using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IStudentService
    {
        public Task<PagedResponse<StudentListResponse>> GetAllStudent(string? filterOn, string? filterQuery, string? sortBy, bool? isAscending, int pageNumber, int pageSize);
        public Task<StudentInfoResponse> GetStudentById(Guid studentId);
        public Task<StudentInfoResponse> GetMyProfileForStudent(Guid userId);

    }
}
