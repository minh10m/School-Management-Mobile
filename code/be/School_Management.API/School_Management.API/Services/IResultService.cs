using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IResultService
    {
        public Task<bool> CreateResult(List<ResultRequest> requests);
    }
}
