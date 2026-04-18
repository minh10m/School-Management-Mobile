using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;
using System.Security.Claims;

namespace School_Management.API.Controllers
{
    [Route("api/payments")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService paymentService;
        private readonly IConfiguration configuration;

        public PaymentsController(IPaymentService paymentService, IConfiguration configuration)
        {
            this.paymentService = paymentService;
            this.configuration = configuration;
        }

        [HttpPost]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> PayTheBill([FromBody] PaymentRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new
            {
                success = false,
                message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
            });

            var result = await paymentService.PayTheBill(request, Guid.Parse(userId));

            return StatusCode(201, new
            {
                success = true,
                message = "Hãy thanh toán đơn hàng này",
                data = result
            }); 
        }

        [HttpPost]
        [Route("webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> ProcessWebhook([FromBody] SepayWebhookRequest request)
        {
            var authHeader = Request.Headers["Authorization"].ToString();
            var secretKey = configuration["Sepay:ApiKey"];

            if (string.IsNullOrEmpty(authHeader) || !authHeader.EndsWith(secretKey))
            {
                return Unauthorized(new { message = "Lỗi xác thực Webhook" });
            }

            try
            {
                await paymentService.ProcessWebhook(request);

                return Ok(new { success = true, message = "Webhook received" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Webhook Error] {ex.Message}");
                return Ok(new { success = false, message = "Internal error but request received" });
            }
        }
    }
}
