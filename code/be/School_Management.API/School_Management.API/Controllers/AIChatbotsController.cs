using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;
using System.Security.Claims;

namespace School_Management.API.Controllers
{
    [Route("api/ai-chatbots")]
    [ApiController]
    public class AIChatbotsController : ControllerBase
    {
        private readonly IAIChatbotService aIChatbotService;

        public AIChatbotsController(IAIChatbotService aIChatbotService)
        {
            this.aIChatbotService = aIChatbotService;
        }

        [HttpPost]
        [Authorize]
        [ValidateModel]
        [Route("chat")]
        public async Task<IActionResult> ChatWithAI([FromBody] AIChatRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new
            {
                success = false,
                message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
            });

            var role = User.FindFirstValue(ClaimTypes.Role);
            if(role == null) return Unauthorized(new
            {
                success = false,
                message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
            });

            var result = await aIChatbotService.ChatWithAI(request, Guid.Parse(userId), role);
            return Ok(new
            {
                success = true,
                data = result
            });
        }
    }
}
