using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;
using System.Security.Claims;

namespace School_Management.API.Controllers
{
    [Route("api/submissions")]
    [ApiController]
    public class SubmissionsController : ControllerBase
    {
        private readonly ISubmissionService submissionService;

        public SubmissionsController(ISubmissionService submissionService)
        {
            this.submissionService = submissionService;
        }

        [HttpPost]
        [ValidateModel]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> CreateSubmission([FromBody] SubmissionRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new
            {
                success = false,
                message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
            });
            var result = await submissionService.CreateSubmission(request, Guid.Parse(userId));
            return StatusCode(201, new
            {
                success = true,
                message = "Nộp bài thành công",
                data = result
            });
        }

        [HttpGet]
        [ValidateModel]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetAllSubmissionOfAssignmentForTeacher([FromQuery] SubmissionFilterRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new
            {
                success = false,
                message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
            });
            var result = await submissionService.GetAllSubmissionOfAssignmentForTeacher(request, Guid.Parse(userId));
            return Ok(result);
        }

        [HttpGet]
        [Route("{submissionId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetSubmissionById([FromRoute] Guid submissionId)
        {
            var result = await submissionService.GetSubmissionById(submissionId);
            return Ok(result);
        }

        [HttpGet]
        [ValidateModel]
        [Route("mySubmission")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetAllSubmissionOfAssignmentForStudent([FromQuery] SubmissionStudentRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new
            {
                success = false,
                message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
            });
            var result = await submissionService.GetSubmissionOfAssignmentForStudent(request, Guid.Parse(userId));
            return Ok(new
            {
                success = true,
                message = result == null ? "Học sinh chưa nộp bài" : "Lấy thông tin bài nộp thành công",
                data = result
            });
        }

        [HttpPatch]
        [Route("{submissionId}/score")]
        [ValidateModel]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> ScoreSubmission([FromBody] ScoreSubmissionRequest request, [FromRoute] Guid submissionId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new
            {
                success = false,
                message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
            });
            var result = await submissionService.ScoreSubmission(request, submissionId, Guid.Parse(userId));
            return Ok(new
            {
                success = true,
                message = "Chấm điểm thành công",
                data = result
            });
        }


    }
}
