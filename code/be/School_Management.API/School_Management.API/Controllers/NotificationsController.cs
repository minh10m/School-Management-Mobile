using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;
using System.Security.Claims;

namespace School_Management.API.Controllers
{
    [Route("api/notifications")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            this.notificationService = notificationService;
        }
        private Guid GetCurrentUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpPost]
        [Authorize]
        [ValidateModel]
        public async Task<IActionResult> CreateNotification([FromBody] CreateNotificationRequest request)
        {
            var result = await notificationService.CreateNotification(request);
            return Ok(new
            {
                success = true,
                message = "Tạo thông báo thành công"
            });
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllNotifications([FromQuery] BaseRequestSecond request)
        {
            if (request.PageNumber < 0) request.PageNumber = 1;
            if (request.PageSize < 0) request.PageSize = 10;
            var userId = GetCurrentUserId();
            var result = await notificationService.GetAllNotifications(userId, request);
            return Ok(new
            {
                success = true,
                data = result
            });
        }

        [HttpDelete]
        [Authorize]
        [Route("{notificationId}")]
        public async Task<IActionResult> DeleteNotificationById([FromRoute] Guid notificationId)
        {
            var result = await notificationService.DeleteNotificationById(notificationId);
            return Ok(new
            {
                success = true,
                message = "Xóa thông báo thành công"
            });
        }
    }
}
