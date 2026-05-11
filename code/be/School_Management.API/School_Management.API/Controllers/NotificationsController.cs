using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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

    }
}
