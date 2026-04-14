using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IFeeDetailService
    {
        public Task<FeeDetailResponse> CreateFeeDetailForStudent(FeeDetailRequest request);
        public Task<FeeDetailResponse> UpdateFeeDetailForStudent(UpdateFeeDetailRequest request, Guid feeDetailId);
    }
}
