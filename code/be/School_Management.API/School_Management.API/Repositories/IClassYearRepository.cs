using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IClassYearRepository
    {
        public Task<(ClassYearResponse? data, string? errorCode)> CreateClassYear(PostOrUpdateClassYearReq request);

    }
}
