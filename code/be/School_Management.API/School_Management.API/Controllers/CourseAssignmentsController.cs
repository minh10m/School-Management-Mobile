using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;

namespace School_Management.API.Controllers
{
    [Route("api/course-assignments")]
    [ApiController]
    public class CourseAssignmentsController : ControllerBase
    {
        private readonly ICourseAssignmentService courseAssignmentService;

        public CourseAssignmentsController(ICourseAssignmentService courseAssignmentService)
        {
            this.courseAssignmentService = courseAssignmentService;
        }

        [HttpPost]
        [ValidateModel]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> CreateCourseAssignment([FromBody] CourseAssignmentRequest request)
        {
            var result = await courseAssignmentService.CreateCourseAssignment(request);
            return StatusCode(201, new
            {
                success = true,
                message = "Tạo bài tập cho khóa học thành công",
                data = result
            });
        }
    }
}
