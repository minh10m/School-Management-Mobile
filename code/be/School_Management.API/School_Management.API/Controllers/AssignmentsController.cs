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
            if (userId == null) return Unauthorized(new { message = "Phiên đăng nhập hết hạn" });
            var result = await assignmentService.CreateAssignment(request, Guid.Parse(userId));
            return StatusCode(201, result);
        }

        [HttpPatch]
        [ValidateModel]
        [Route("{assignmentId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateAssignment([FromBody] PostOrUpdateAssignmentRequest request, [FromRoute] Guid assignmentId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new { message = "Phiên đăng nhập hết hạn" });
            var result = await assignmentService.UpdateAssignment(request, Guid.Parse(userId), assignmentId);
            return Ok(result);
        }
    }
}
