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

        [HttpGet]
        [ValidateModel]
        [Route("my")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetMyCourseForTeacher([FromQuery] MyCourseFilterRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new
            {
                success = false,
                message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
            });
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;
            var result = await courseService.GetMyCourseForTeacher(request, Guid.Parse(userId));
            return Ok(new
            {
                data = result,
                success = true
            });
        }

        [HttpGet]
        [Route("{courseId}")]
        [Authorize]
        public async Task<IActionResult> GetCourseById([FromRoute] Guid courseId)
        {
            var result = await courseService.GetCourseById(courseId);
            return Ok(new
            {
                success = true, 
                data = result
            });
        }

        [HttpPatch]
        [ValidateModel]
        [Route("{courseId}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ReviseCourseForAdmin([FromRoute] Guid courseId, [FromBody] UpdateStatusCourseRequest request)
        {
            var result = await courseService.ReviseCourseForAdmin(courseId, request);
            return Ok(new
            {
                success = true,
                message = "Thay đổi thông tin thành công",
                data = result
            });
        }

        [HttpGet]
        [ValidateModel]
        [Route("all/forAdmin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllCourseForAdmin([FromQuery] CourseFilterRequestAdmin request)
        {
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;
            var result = await courseService.GetAllCourseForAdmin(request);
            return Ok(new
            {
                success = true, 
                data = result
            });
        }

        [HttpGet]
        [ValidateModel]
        [Route("all/approved")]
        [Authorize(Roles = "Teacher,Student")]
        public async Task<IActionResult> GetAllCourseForTeacherAndStudent([FromQuery] CourseFilterRequestTeacherAndStudent request)
        {
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;
            var result = await courseService.GetAllCourseForTeacherAndStudent(request);
            return Ok(new
            {
                success = true,
                data = result
            });
        }

    }
}
