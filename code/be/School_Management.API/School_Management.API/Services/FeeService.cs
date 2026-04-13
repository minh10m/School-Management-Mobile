using School_Management.API.Exceptions;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class FeeService : IFeeService
    {
        private readonly IFeeRepository feeRepository;

        public FeeService(IFeeRepository feeRepository)
        {
            this.feeRepository = feeRepository;
        }
        public async Task<FeeResponse> CreateFee(FeeRequest request)
        {
            var (result, message) = await feeRepository.CreateFee(request);
            return message switch
            {
                "AMOUNT_IS_NEGATIVE" => throw new BadRequestException("Số tiền của phí không được âm"),
                "CONFLICT_TITLE" => throw new ConflictException("Tên tiêu đề đã tồn tại"),
                "NOT_FOUND_CLASS" => throw new NotFoundException("Lớp không tồn tại"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }
    }
}
