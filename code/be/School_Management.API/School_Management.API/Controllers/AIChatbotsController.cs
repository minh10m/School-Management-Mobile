using Azure.Core;
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

        [HttpPost]
        [Route("upload")]
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadKnowledgeBaseAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File không hợp lệ");

            var result = await aIChatbotService.UploadKnowledgeBaseAsync(file);

            if(result)
            {
                return Ok(new
                {
                    success = true,
                    message = "Thêm tài liệu thành công"
                });
            }

            return StatusCode(500, "Có lỗi xảy ra trong quá trình nạp kiến thức.");

        }

        [HttpGet]
        [Route("chat-history")]
        [Authorize]
        public async Task<IActionResult> GetUserAIHistoryChatResponses([FromQuery] BaseRequestSecond request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new
            {
                success = false,
                message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
            });
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;
            var result = await aIChatbotService.GetUserAIHistoryChatResponses(request, Guid.Parse(userId));

            return Ok(new
            {
                success = true,
                data = result
            });
        }
    }
}
