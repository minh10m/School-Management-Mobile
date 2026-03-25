using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;

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
        //[Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateSchedule([FromBody] PostUpdateScheduleRequest request)
        {
            var result = await scheduleService.CreateSchedule(request);
            return CreatedAtAction(nameof(CreateSchedule), new { id = result?.ScheduleId }, result);
        }
    }
}
