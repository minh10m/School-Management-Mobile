using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IPaymentRepository
    {
        public Task<(PaymentResponse? data, string message)> PayTheBill(PaymentRequest request, Guid userId);
        public Task<(bool result, string message)> ProcessWebhook(SepayWebhookRequest request);

    }
}
