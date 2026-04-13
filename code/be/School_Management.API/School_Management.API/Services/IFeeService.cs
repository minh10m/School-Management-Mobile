using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IFeeService
    {
        public Task<FeeResponse> CreateFee(FeeRequest request);
        public Task<PagedResponse<FeeResponse>> GetAllFee(FeeFilterRequest request);
        public Task<PagedResponse<FeeDetailResponse>> GetAllFeeDetailOfFee(FeeDetailFilterRequest request);
    }
}
