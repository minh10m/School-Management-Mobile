using School_Management.API.Exceptions;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class FeeDetailService : IFeeDetailService
    {
        private readonly IFeeDetailRepository feeDetailRepository;

        public FeeDetailService(IFeeDetailRepository feeDetailRepository)
        {
            this.feeDetailRepository = feeDetailRepository;
        }
        public async Task<FeeDetailResponse> CreateFeeDetailForStudent(FeeDetailRequest request)
        {
            var (result, message) = await feeDetailRepository.CreateFeeDetailForStudent(request);
            return message switch
            {
                "CONFLICT_REASON" => throw new ConflictException("Tiêu đề phí của học sinh này đã tồn tại trong năm"),
                "NOT_FOUND_STUDENT" => throw new NotFoundException("Học sinh này không tồn tại"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }
    }
}
