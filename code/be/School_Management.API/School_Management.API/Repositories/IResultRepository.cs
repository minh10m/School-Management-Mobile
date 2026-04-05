using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IResultRepository
    {
        public Task<(bool result, string? message)> CreateResult(List<ResultRequest> requests);
        public Task<(ResultResponse? data, string? message)> UpdateResult(UpdateResultRequest request, Guid resultId, Guid userId);

    }
}
