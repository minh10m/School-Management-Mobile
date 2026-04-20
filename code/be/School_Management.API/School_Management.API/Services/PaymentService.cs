using School_Management.API.Exceptions;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;
using System.Net.Http.Json;
using System.Linq;
using System;
using System.Collections.Generic;
using System.Net.Http;

namespace School_Management.API.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository paymentRepository;
        private readonly IHttpClientFactory httpClientFactory;
        private readonly IConfiguration configuration;

        public PaymentService(IPaymentRepository paymentRepository, IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            this.paymentRepository = paymentRepository;
            this.httpClientFactory = httpClientFactory;
            this.configuration = configuration;
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

        public async Task<bool> CheckAndUpdatePaymentStatus(string orderCode)
        {
            var apiKey = configuration["Sepay:ApiKey"];
            var apiUrl = "https://my.sepay.vn/userapi/transactions/list?limit=20";

            using var client = httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

            try
            {
                var response = await client.GetAsync(apiUrl);
                if (!response.IsSuccessStatusCode) return false;

                var data = await response.Content.ReadFromJsonAsync<SepayTransactionListResponse>();
                if (data == null || data.Status != 200 || data.Transactions == null) return false;

                // Tìm giao dịch khớp với mã đơn hàng
                var match = data.Transactions.FirstOrDefault(tx => 
                    !string.IsNullOrEmpty(tx.TransactionContent) && 
                    tx.TransactionContent.Contains(orderCode, StringComparison.OrdinalIgnoreCase));

                if (match != null)
                {
                    // Chuyển đổi giao dịch SePay thành WebhookRequest để tái sử dụng logic xử lý
                    var webhookRequest = new SepayWebhookRequest
                    {
                        Id = match.Id,
                        Gateway = match.BankBrandName,
                        Amount = match.AmountIn,
                        TransferAmount = match.AmountIn,
                        Content = match.TransactionContent,
                        TransferType = "IN",
                        TransactionDate = match.TransactionDate,
                        ReferenceCode = match.ReferenceNumber
                    };

                    return await ProcessWebhook(webhookRequest);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Sepay Check Error] {ex.Message}");
            }

            return false;
        }
    }
}
