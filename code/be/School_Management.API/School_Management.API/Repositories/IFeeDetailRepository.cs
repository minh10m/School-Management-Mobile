using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IFeeDetailRepository
    {
        public Task<(FeeDetailResponse? data, string message)> CreateFeeDetailForStudent(FeeDetailRequest request);
        public Task<(FeeDetailResponse? data, string message)> UpdateFeeDetailForStudent(UpdateFeeDetailRequest request, Guid feeDetailId);
        public Task<(PagedResponse<FeeDetailResponse>? data, string message)> GetAllMyFeeForStudent(MyFeeDetailFilterRequest request, Guid userId);

    }
}
