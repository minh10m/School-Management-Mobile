using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;

namespace School_Management.API.Controllers
{
    [Route("api/lessons")]
    [ApiController]
    public class LessonsController : ControllerBase
    {
        private readonly ILessonService lessonService;

        public LessonsController(ILessonService lessonService)
        {
            this.lessonService = lessonService;
        }

        [HttpPost]
        [Authorize(Roles = "Teacher")]
        [ValidateModel]
        public async Task<IActionResult> CreateLesson([FromBody] LessonRequest request)
        {
            var result = await lessonService.CreateLesson(request);
            return StatusCode(201, new
            {
                success = true,
                message = "Tạo mới bài học thành công",
                data = result
            });
        }

        [HttpPatch]
        [ValidateModel]
        [Route("{lessonId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateLesson([FromBody] UpdateLessonRequest request, [FromRoute] Guid lessonId)
        {
            var result = await lessonService.UpdateLesson(request, lessonId);
            return Ok(new
            {
                success = true, 
                message = "Cập nhật thành công",
                data = result
            });
        }
    }
}
