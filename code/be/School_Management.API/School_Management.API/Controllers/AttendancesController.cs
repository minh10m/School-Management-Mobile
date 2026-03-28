using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;
using System.Security.Claims;

namespace School_Management.API.Controllers
{
    [Route("api/attendances")]
    [ApiController]
    public class AttendancesController : ControllerBase
    {
        private readonly IAttendanceService attendanceService;

        public AttendancesController(IAttendanceService attendanceService)
        {
            this.attendanceService = attendanceService;
        }

        [HttpPost]
        [ValidateModel]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> AttendanceCheck([FromBody] AttendanceRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new { Message = "Phiên làm việc hết hạn" });
            var result = await attendanceService.AttendanceCheck(request, Guid.Parse(userId));
            return Ok(result);
        }

        [HttpGet]
        [ValidateModel]
        [Route("class")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetClassAttendance([FromQuery] ClassAttendanceRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new { Message = "Phiên làm việc hết hạn" });

            var result = await attendanceService.GetClassAttendance(request, Guid.Parse(userId));
            return Ok(result);
        }
    }
}
