using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;
using System.Security.Claims;

namespace School_Management.API.Controllers
{
    [Route("api/courses")]
    [ApiController]
    public class CoursesController : ControllerBase
    {
        private readonly ICourseService courseService;

        public CoursesController(ICourseService courseService)
        {
            this.courseService = courseService;
        }

        [HttpPost]
        [ValidateModel]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> CreateCourse([FromBody] CreateCourseRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new
            {
                success = false,
                message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
            });
            var result = await courseService.CreateCourse(request, Guid.Parse(userId));

            return StatusCode(201, new
            {
                success = true, 
                data = result,
                message = "Tạo khóa học thành công"
            });
        }

        [HttpPatch]
        [ValidateModel]
        [Route("{courseId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateCourse([FromBody] CreateCourseRequest request, [FromRoute] Guid courseId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new
            {
                success = false,
                message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
            });
            var result = await courseService.UpdateCourse(request, courseId, Guid.Parse(userId));
            return Ok(new { 
                success = true, 
                data = result,
                message = "Cập nhật thành công"
            });
        }
    }
}
