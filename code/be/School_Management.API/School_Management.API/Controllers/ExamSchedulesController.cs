using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;

namespace School_Management.API.Controllers
{
    [Route("api/exam-schedules")]
    [ApiController]
    public class ExamSchedulesController : ControllerBase
    {
        private readonly IExamScheduleService examScheduleService;

        public ExamSchedulesController(IExamScheduleService examScheduleService)
        {
            this.examScheduleService = examScheduleService;
        }

        [HttpPost]
        [ValidateModel]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateExamSchedule([FromBody] ExamScheduleRequest request)
        {
            var result = await examScheduleService.CreateExamSchedule(request);
            return StatusCode(201, new
            {
                success = true, 
                message = "Tạo lịch thi thành công",
                data = result
            });
        }
    }
}
