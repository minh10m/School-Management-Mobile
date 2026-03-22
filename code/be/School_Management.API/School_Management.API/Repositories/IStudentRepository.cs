using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IStudentRepository
    {
        public Task<PagedResponse<StudentListResponse>> GetAllStudent(string? filterOn, string? filterQuery, string? sortBy, bool? isAscending, int pageNumber, int pageSize);
    }
}
