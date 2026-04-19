using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;
using System.Security.Claims;

namespace School_Management.API.Controllers
{
    [Route("api/assignments")]
    [ApiController]
    public class AssignmentsController : ControllerBase
    {
        private readonly IAssignmentService assignmentService;

        public AssignmentsController(IAssignmentService assignmentService)
        {
            this.assignmentService = assignmentService;
        }

        [HttpPost]
        [ValidateModel]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> CreateAssignment([FromBody] PostOrUpdateAssignmentRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new
            {
                success = false,
                message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
            });
            var result = await assignmentService.CreateAssignment(request, Guid.Parse(userId));
            return StatusCode(210, new
            {
                success = true,
                message = "Tạo bài tập thành công",
                data = result
            });
        }

        [HttpPatch]
        [ValidateModel]
        [Route("{assignmentId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateAssignment([FromBody] PostOrUpdateAssignmentRequest request, [FromRoute] Guid assignmentId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new
            {
                success = false,
                message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
            });
            var result = await assignmentService.UpdateAssignment(request, Guid.Parse(userId), assignmentId);
            return Ok(result);
        }

        [HttpGet]
        [ValidateModel]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetAllAssignment([FromQuery] AssignmentFilterRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new
            {
                success = false,
                message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
            });
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;
            var result = await assignmentService.GetAllAssignment(request, Guid.Parse(userId));
            return Ok(result);
        }

        [HttpGet]
        [Route("{assignmentId}")]
        [Authorize]
        public async Task<IActionResult> GetAssignmentById([FromRoute] Guid assignmentId)
        {
            var result = await assignmentService.GetAssignmentById(assignmentId);
            return Ok(result);
        }

        [HttpGet]
        [Route("my")]
        [ValidateModel]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetAssignmentForStudent([FromQuery] AssignmentForStudentRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new
            {
                success = false,
                message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
            });
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;
            var result = await assignmentService.GetMyAssignmentsForStudent(request, Guid.Parse(userId));
            return Ok(result);
        }
    }
}
