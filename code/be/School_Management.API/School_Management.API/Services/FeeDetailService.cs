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

        public async Task<FeeDetailResponse> UpdateFeeDetailForStudent(UpdateFeeDetailRequest request, Guid feeDetailId)
        {
            var (result, message) = await feeDetailRepository.UpdateFeeDetailForStudent(request, feeDetailId);
            return message switch
            {
                "NOT_FOUND_FEE_DETAIL" => throw new NotFoundException("Không tìm thấy chi tiết phí này"),
                "CANNOT_UPDATE_AMOUNT_ALREADY_PAID" => throw new ForbiddenException("Không thể cập nhật số tiền phí vì học sinh đã đóng rồi"),
                "CONFLICT_REASON" => throw new ConflictException("Tiêu đề phí của học sinh này đã tồn tại trong năm"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }
    }
}
