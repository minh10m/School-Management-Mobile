using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IFeeDetailRepository
    {
        public Task<(FeeDetailResponse? data, string message)> CreateFeeDetailForStudent(FeeDetailRequest request);

    }
}
