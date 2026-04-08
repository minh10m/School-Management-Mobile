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

        [HttpPost]
        [Authorize(Roles = "Admin")]
        [Route("{examScheduleId}/details")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateExamScheduleDetail(IFormFile file, [FromRoute] Guid examScheduleId)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { success = false, message = "Vui lòng chọn file Excel để upload." });
            }
            var result = await examScheduleService.CreateExamScheduleDetail(file, examScheduleId);
            return StatusCode(201, new
            {
                success = result, 
                message = "Tạo chi tiết lịch thi thành công"
            });
        }
    }
}
