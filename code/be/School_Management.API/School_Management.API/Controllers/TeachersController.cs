using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;
using System.Security.Claims;

namespace School_Management.API.Controllers
{
    [Route("api/teachers")]
    [ApiController]
    public class TeachersController : ControllerBase
    {
        private readonly ITeacherService teacherService;

        public TeachersController(ITeacherService teacherService)
        {
            this.teacherService = teacherService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllTeacher([FromQuery] TeacherFilterRequest request)
        {
            if (request.SortBy == null) request.SortBy = "FullName";
            if (request.PageSize < 0) request.PageSize = 10;
            if (request.PageNumber < 0) request.PageNumber = 1;
            var result = await teacherService.GetAllTeacher(request);
            return Ok(result);
        }

        [HttpGet]
        [Route("{teacherId}")]
        [Authorize]
        public async Task<IActionResult> GetTeacherById([FromRoute] Guid teacherId)
        {
            var result = await teacherService.GetTeacherById(teacherId);
            return Ok(result);
        }

        [HttpGet]
        [Route("me")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetMyProfileForTeacher()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new { message = "Phiên làm việc hết hạn" });
            var result = await teacherService.GetMyProfileForTeacher(Guid.Parse(userId));
            return Ok(result);
        }

        [HttpPatch]
        [Route("{teacherId}")]
        [Authorize(Roles = "Admin")]
        [ValidateModel]
        public async Task<IActionResult> UpdateTeacherForAdmin([FromRoute] Guid teacherId, [FromBody] UpdateUserRequest request)
        {
            var result = await teacherService.UpdateTeacherForAdmin(request, teacherId);
            return Ok(result);
        }

        [HttpPatch]
        [Route("me")]
        [Authorize(Roles = "Teacher")]
        [ValidateModel]
        public async Task<IActionResult> UpdateProfileForTeacher([FromBody] UpdateUserRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new { message = "Phiên làm việc hết hạn" });
            var result = await teacherService.UpdateMyProfileForTeacher(request, Guid.Parse(userId));
            return Ok(result);
        }
    }
}
