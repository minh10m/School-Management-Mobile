using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IPaymentService
    {
        public Task<PaymentResponse> PayTheBill(PaymentRequest request, Guid userId);
        public Task<bool> ProcessWebhook(SepayWebhookRequest request);
        public Task<IEnumerable<PaymentHistoryResponse>> GetMyPayments(Guid userId);
        public Task<IEnumerable<PaymentHistoryResponse>> GetAllPayments();
    }
}
