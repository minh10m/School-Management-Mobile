using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;
using System.Security.Claims;

namespace School_Management.API.Controllers
{
    [Route("api/conversations")]
    [ApiController]
    public class ConversationsController : ControllerBase
    {
        private readonly IConversationService conversationService;

        public ConversationsController(IConversationService conversationService)
        {
            this.conversationService = conversationService;
        }

        private Guid GetCurrentUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet("check/{otherUserId}")]
        [Authorize]
        public async Task<IActionResult> CheckConversation([FromRoute] Guid otherUserId)
        {
            var result = await conversationService.CheckMessageExisted(new CheckMessageExistedRequest
            {
                SenderId = GetCurrentUserId(),
                ReceiverId = otherUserId
            });
            return Ok(new
            {
                success = true,
                data = result
            });
        }

        [HttpPost("send")]
        [Authorize]
        [ValidateModel]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            var result = await conversationService.SendMessage(request, GetCurrentUserId());
            return Ok(new
            {
                success = true,
                data = result,
                message = "Gửi tin nhắn thành công"
            });
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetMyConversations([FromQuery] GetConversationFilterRequest request)
        {
            if (request.PageNumber < 0) request.PageNumber = 1;
            if (request.PageSize < 0) request.PageSize = 20;
            var result = await conversationService.GetMyConversation(request, GetCurrentUserId());
            return Ok(result);
        }

        [HttpGet("{conversationId}/messages")]
        [Authorize]
        public async Task<IActionResult> GetMessages([FromRoute] Guid conversationId, [FromQuery] BaseRequestSecond request)
        {
            var result = await conversationService.GetMessage(request, conversationId, GetCurrentUserId());
            return Ok(new
            {
                data = result,
                success = true
            });
        }

        [HttpPost("group")]
        [Authorize]
        [ValidateModel]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateGroup([FromForm] CreateGroupRequest request)
        {
            var result = await conversationService.CreateGroup(request, GetCurrentUserId());
            return Ok(new
            {
                success = true,
                message = "Tạo nhóm thành công",
                data = result
            });
        }

        [HttpPost("group/members")]
        [Authorize]
        [ValidateModel]
        public async Task<IActionResult> AddMembersToGroup([FromBody] AddMembersRequest request)
        {
            var result = await conversationService.AddMembersToGroup(request, GetCurrentUserId());
            return Ok(new
            {
                success = true,
                message = "Thêm thành viên vào nhóm thành công",
                data = result
            });
        }

        [HttpDelete("group/{conversationId}/leave")]
        [Authorize]
        public async Task<IActionResult> LeaveGroup([FromRoute] Guid conversationId)
        {
            var result = await conversationService.LeaveGroup(conversationId, GetCurrentUserId());
            return Ok(new
            {
                success = result,
                message = "Rời nhóm thành công"
            });
        }

        [HttpPatch("{conversationId}")]
        [Authorize]
        [ValidateModel]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateConversation([FromRoute] Guid conversationId, [FromForm] UpdateGroupRequest request)
        {

            var result = await conversationService.UpdateConversation(request, conversationId, GetCurrentUserId());
            return Ok(new
            {
                success = true,
                message = "Cập nhật thông tin thành công",
                data = result
            });
        }

        [HttpDelete]
        [Authorize]
        [Route("{messageId}")]
        public async Task<IActionResult> DeleteMessageById([FromRoute] Guid messageId)
        {
            var result = await conversationService.DeleteMessageById(messageId, GetCurrentUserId());
            return Ok(new
            {
                success = true,
                message = "Gỡ tin nhắn thành công"
            });
        }
    }
}
