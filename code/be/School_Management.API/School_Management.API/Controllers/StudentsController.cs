using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using School_Management.API.Services;
using System.Security.Claims;

namespace School_Management.API.Controllers
{
    [Route("api/students")]
    [ApiController]
    public class StudentsController : ControllerBase
    {
        private readonly IStudentService studentService;
        private readonly UserManager<AppUser> userManager;

        public StudentsController(IStudentService studentService, UserManager<AppUser> userManager)
        {
            this.studentService = studentService;
            this.userManager = userManager;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllStudent(
            [FromQuery] string? filterOn, [FromQuery] string? filterQuery,
            [FromQuery] string? sortBy = "FullName", [FromQuery] bool? isAscending = true,
            [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var result = await studentService.GetAllStudent(filterOn, filterQuery, sortBy, isAscending, pageNumber, pageSize);
            return Ok(result);
        }

        [HttpGet]
        [Route("{studentId}")]
        [Authorize]
        public async Task<IActionResult> GetStudentById([FromRoute] Guid studentId)
        {
            var result = await studentService.GetStudentById(studentId);
            return Ok(result);
        }

        [HttpGet]
        [Route("me")]
        [Authorize]
        public async Task<IActionResult> GetMyProfileForStudent()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new { Message = "Phiên làm việc hết hạn" });

            var result = await studentService.GetMyProfileForStudent(Guid.Parse(userId));
            return Ok(result);
        }

        [HttpPatch]
        [Route("{studentId}")]
        [ValidateModel]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> UpdateStudentByAdminOrTeacher([FromRoute] Guid studentId, UpdateUserRequest updateUserRequest)
        {
            var result = await studentService.UpdateStudentByAdminOrTeacher(updateUserRequest, studentId, User);
            return Ok(result);
        }

        [HttpPatch]
        [Route("me")]
        [Authorize(Roles = "Student")]

        public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateUserRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new {Message = "Phiên làm việc hết hạn"});


            var result = await studentService.UpdateMyProfileForStudent(request, Guid.Parse(userId));
            return Ok(result);
        }

        [HttpPatch]
        [Route("{studentId}/classYear")]
        [ValidateModel]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ChangeClass([FromRoute] Guid studentId, [FromBody] ChangeClassRequest request)
        {
            var result = await studentService.ChangeClassForStudent(request, studentId);
            return Ok(result);
        }
    }
}
