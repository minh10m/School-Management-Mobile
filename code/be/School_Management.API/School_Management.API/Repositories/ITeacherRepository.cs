using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface ITeacherRepository
    {
        public Task<PagedResponse<TeacherListResponse>> GetAllTeacher(string? filterOn, string? filterQuery, string? sortBy, bool isAscending, int pageNumber, int pageSize);

    }
}
