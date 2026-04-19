using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;
using System.Security.Claims;

namespace School_Management.API.Controllers
{
    [Route("api/schedules")]
    [ApiController]
    public class SchedulesController : ControllerBase
    {
        private readonly IScheduleService scheduleService;

        public SchedulesController(IScheduleService scheduleService)
        {
            this.scheduleService = scheduleService;
        }

        [HttpPost]
        [ValidateModel]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateSchedule([FromBody] PostUpdateScheduleRequest request)
        {
            var result = await scheduleService.CreateSchedule(request);
            return CreatedAtAction(nameof(CreateSchedule), new { id = result?.ScheduleId }, result);
        }

        [HttpPatch]
        [ValidateModel]
        [Route("{scheduleId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateSchedule([FromRoute] Guid scheduleId, [FromBody] PostUpdateScheduleRequest request)
        {
            var result = await scheduleService.UpdateSchedule(request, scheduleId);
            return Ok(result);
        }

        [HttpPost]
        [ValidateModel]
        [Route("{scheduleId}/details")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateScheduleDetail([FromBody] List<PostUpdateScheduleDetailRequest> request, [FromRoute] Guid scheduleId)
        {
            var count = await scheduleService.CreateScheduleDetail(request, scheduleId);
            return Ok(new { Message = $"Đã tạo thành công {count} tiết học." });
        }

        [HttpPut]
        [ValidateModel]
        [Route("{scheduleId}/details")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateScheduleDetail([FromRoute] Guid scheduleId, [FromBody] List<PostUpdateScheduleDetailRequest> request)
        {
            var result = await scheduleService.UpdateScheduleDetail(request, scheduleId);
            return Ok(result);

        }

        [HttpGet]
        [Route("classes/me")]
        [ValidateModel]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyScheduleForStudent([FromQuery] ScheduleDetailIsActiveRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new
            {
                success = false,
                message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
            });
            var result = await scheduleService.GetMyScheduleForStudent(request, Guid.Parse(userId));
            return Ok(result);
        }

        [HttpGet]
        [Route("teacher/me")]
        [ValidateModel]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetMyScheduleForTeacher([FromQuery] ScheduleDetailIsActiveRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new
            {
                success = false,
                message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
            });
            var result = await scheduleService.GetMyScheduleForTeacher(request, Guid.Parse(userId));
            return Ok(result);
        }

        [HttpGet]
        [ValidateModel]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllScheduleForAdmin([FromQuery] ScheduleFilterRequest request)
        {
            if (request.SortBy == null) request.SortBy = "Name";
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;
            var result = await scheduleService.GetAllScheduleForAdmin(request);
            return Ok(result);
        }

        [HttpGet]
        [Route("{scheduleId}/details")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetScheduleDetailByScheduleId([FromRoute] Guid scheduleId)
        {
            var result = await scheduleService.GetScheduleDetailByScheduleId(scheduleId);
            return Ok(result);
        }
        [HttpGet]
        [Route("class/{classYearId}/active")]
        [Authorize]
        public async Task<IActionResult> GetActiveScheduleByClassYearId([FromRoute] Guid classYearId, [FromQuery] int term, [FromQuery] int schoolYear)
        {
            var result = await scheduleService.GetActiveScheduleByClassYearId(classYearId, term, schoolYear);
            return Ok(result ?? new List<ScheduleDetailResponse>());
        }
    }
}
