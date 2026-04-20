using School_Management.API.Exceptions;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository paymentRepository;

        public PaymentService(IPaymentRepository paymentRepository)
        {
            this.paymentRepository = paymentRepository;
        }
        public async Task<IEnumerable<PaymentHistoryResponse>> GetMyPayments(Guid userId)
        {
            var payments = await paymentRepository.GetMyPayments(userId);
            return payments.Select(p => new PaymentHistoryResponse
            {
                PaymentId = p.Id,
                OrderCode = p.OrderCode,
                Amount = p.Amount,
                Type = p.Type,
                Status = p.Status,
                Description = p.Description,
                CreatedAt = p.CreatedAt,
                UserName = p.User.FullName
            });
        }

        public async Task<IEnumerable<PaymentHistoryResponse>> GetAllPayments()
        {
            var payments = await paymentRepository.GetAllPayments();
            return payments.Select(p => new PaymentHistoryResponse
            {
                PaymentId = p.Id,
                OrderCode = p.OrderCode,
                Amount = p.Amount,
                Type = p.Type,
                Status = p.Status,
                Description = p.Description,
                CreatedAt = p.CreatedAt,
                UserName = p.User.FullName
            });
        }

        public async Task<PaymentResponse> PayTheBill(PaymentRequest request, Guid userId)
        {
            var (result, message) = await paymentRepository.PayTheBill(request, userId);
            return message switch
            {
                "BOTH_HAVE_VALUE" => throw new BadRequestException("Chỉ được một trong hai có giá trị (khóa học hoặc phí)"),
                "BOTH_ARE_NULL" => throw new BadRequestException("Một trong hai phải tồn tại giá trị"),
                "NOT_FOUND_STUDENT" => throw new NotFoundException("Bạn không phải là học sinh để mua khóa học này"),
                "NOT_FOUND_COURSE" => throw new NotFoundException("Không tìm thấy khóa học này"),
                "YOU_BUY_THIS_COURSE" => throw new ConflictException("Bạn đã mua khóa học này rồi"),
                "NOT_FOUND_FEE_DETAIL" => throw new NotFoundException("Không tìm thấy loại phí này"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<bool> ProcessWebhook(SepayWebhookRequest request)
        {
            var (result, message) = await paymentRepository.ProcessWebhook(request);

            if (result) return true;

            return message switch
            {
                "INSUFFICIENT_AMOUNT" or "NOT_FOUND_STUDENT" or "NOT_FOUND_FEE_DETAIL" => false,
                "ORDER_CODE_NOT_FOUND" or "PAYMENT_NOT_FOUND" or "DUPLICATE_TRANSACTION" => false,
                _ => false
            };
        }
    }
}
