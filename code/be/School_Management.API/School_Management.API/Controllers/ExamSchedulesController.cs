using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.Domain;
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
                message = "Tạo chi tiết lịch thi thành công",
                data = result
            });
        }

        [HttpPost]
        [Route("{examScheduleId}/details/assign")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignStudentIntoExamScheduleDetail([FromRoute] Guid examScheduleId)
        {
            var result = await examScheduleService.AssignStudentIntoExamScheduleDetail(examScheduleId);
            return StatusCode(201, new
            {
                success = result,
                message = "Phân bổ học sinh vào chi tiết lịch thành công",
                data = result
            });
        }

        [HttpPatch]
        [Route("{examScheduleId}")]
        [Authorize(Roles = "Admin")]
        [ValidateModel]
        public async Task<IActionResult> UpdateExamSchedule([FromBody] ExamScheduleRequest request, [FromRoute] Guid examScheduleId)
        {
            var result = await examScheduleService.UpdateExamSchedule(request, examScheduleId);
            return Ok(new
            {
                success = true,
                message = "Cập nhật thành công",
                data = result
            });
        }

        [HttpPatch]
        [ValidateModel]
        [Route("details/{examScheduleDetailId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateExamScheduleDetail([FromBody] UpdateExamScheduleDetail request, [FromRoute] Guid examScheduleDetailId)
        {
            var result = await examScheduleService.UpdateExamScheduleDetail(request, examScheduleDetailId);
            return Ok(new
            {
                success = true,
                message = "Cập nhật thành công",
                data = result
            });
        }

        [HttpGet]
        [ValidateModel]
        [Route("{examScheduleId}/details")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllExamScheduleDetail([FromQuery] ExamScheduleDetailFilterRequest request, [FromRoute] Guid examScheduleId)
        {
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;
            var result = await examScheduleService.GetAllExamScheduleDetail(request, examScheduleId);
            return Ok(new
            {
                success = true,
                data = result
            });
        }

        [HttpGet]
        [ValidateModel]
        [Route("details/{examScheduleDetailId}/assign")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetAllExamStudentAssignment([FromQuery] ExamStudentAssignmentFilterRequest request, [FromRoute] Guid examScheduleDetailId)
        {
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;
            var result = await examScheduleService.GetAllExamStudentAssignment(request, examScheduleDetailId);
            return Ok(new
            {
                success = true,
                data = result
            });
        }

        [HttpGet]
        [ValidateModel]
        [Authorize(Roles = "Teacher,Student")]
        public async Task<IActionResult> GetMyExamSchedule([FromQuery] MyExamScheduleDetailRequest request)
        {
            var result = await examScheduleService.GetMyExamSchedule(request, User);
            return Ok(new
            {
                success = true,
                data = result
            });
        }

        [HttpGet]
        [ValidateModel]
        [Route("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllExamSchedule([FromQuery] ExamScheduleFilterRequest request)
        {
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;
            var result = await examScheduleService.GetAllExamSchedule(request);
            return Ok(new
            {
                success = true,
                data = result
            });
        }
        [HttpDelete("{examScheduleId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteExamSchedule([FromRoute] Guid examScheduleId)
        {
            var result = await examScheduleService.DeleteExamSchedule(examScheduleId);
            return Ok(new
            {
                success = result,
                message = "Xóa lịch thi thành công",
                data = result
            });
        }
    }
}
