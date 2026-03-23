using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IStudentRepository
    {
        public Task<PagedResponse<StudentListResponse>> GetAllStudent(string? filterOn, string? filterQuery, string? sortBy, bool? isAscending, int pageNumber, int pageSize);
        public Task<StudentInfoResponse> GetStudentById(Guid studentId);
        public Task<StudentInfoResponse> GetMyProfileForStudent(Guid userId);
        public  Task<Guid> GetUserIdByStudentId(Guid studentId);
        public Task<Guid> GetStudentIdByUserId(Guid userId);
        public Task<Guid?> GetHomeRoomId(Guid studentId);
        public Task<StudentClassYear?> GetClassRelationByStudentId(Guid studentId);

    }
}
