using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IFeeRepository
    {
        public Task<(FeeResponse? data, string message)> CreateFee(FeeRequest request);
        public Task<PagedResponse<FeeResponse>> GetAllFee(FeeFilterRequest request);

    }
}
