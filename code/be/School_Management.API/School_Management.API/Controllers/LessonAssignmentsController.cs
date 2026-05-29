using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;
using System.Security.Claims;

namespace School_Management.API.Controllers
{
    [Route("api/lesson-assignments")]
    [ApiController]
    public class LessonAssignmentsController : ControllerBase
    {
        private readonly ILessonAssignmentService lessonAssignmentService;

        public LessonAssignmentsController(ILessonAssignmentService lessonAssignmentService)
        {
            this.lessonAssignmentService = lessonAssignmentService;
        }

        [HttpPost]
        [ValidateModel]
        [Authorize(Roles = "Teacher")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateLessonAssignment([FromForm] LessonAssignmentRequest request)
        {
            var result = await lessonAssignmentService.CreateLessonAssignment(request);
            return StatusCode(201, new
            {
                success = true,
                message = "Tạo bài tập cho khóa học thành công",
                data = result
            });
        }

        [HttpPatch]
        [ValidateModel]
        [Route("{lessonAssignmentId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateLessonAssignment([FromBody] UpdateLessonAssignmentRequest request, [FromRoute] Guid lessonAssignmentId)
        {
            var result = await lessonAssignmentService.UpdateLessonAssignment(request, lessonAssignmentId);
            return Ok(new
            {
                success = true, 
                message = "Cập nhật thông tin thành công",
                data = result
            });
        }

        [HttpGet]
        [ValidateModel]
        [Authorize]
        public async Task<IActionResult> GetAllLessonAssignment([FromQuery] LessonAssignmentFilterRequest request)
        {
            var result = await lessonAssignmentService.GetAllLessonAssignment(request);
            return Ok(new
            {
                success = true,
                data = result
            });
        }

        [HttpGet]
        [Route("{lessonAssignmentId}")]
        [Authorize]
        public async Task<IActionResult> GetLessonAssignmentById([FromRoute] Guid lessonAssignmentId)
        {
            var result = await lessonAssignmentService.GetLessonAssignmentById(lessonAssignmentId);
            return Ok(new
            {
                success = true,
                data = result
            });
        }

        [HttpDelete]
        [Route("{lessonAssignmentId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> DeleteLessonAssignmentById([FromRoute] Guid lessonAssignmentId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new { message = "Phiên đăng nhập không hợp lệ hoặc hết hạn" });
            var result = await lessonAssignmentService.HardDeleteLessonAssignment(lessonAssignmentId, Guid.Parse(userId));
            return Ok(new
            {
                success = true,
                message = "Xóa bài tập thành công"
            });
        }
    }
}
