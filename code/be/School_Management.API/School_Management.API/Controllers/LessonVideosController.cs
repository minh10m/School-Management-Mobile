using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;

namespace School_Management.API.Controllers
{
    [Route("api/lesson-videos")]
    [ApiController]
    public class LessonVideosController : ControllerBase
    {
        private readonly ILessonVideoService lessonVideoService;

        public LessonVideosController(ILessonVideoService lessonVideoService)
        {
            this.lessonVideoService = lessonVideoService;
        }

        [HttpPost]
        [ValidateModel]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> CreateLessonVideo([FromBody] LessonVideoRequest request)
        {
            var result = await lessonVideoService.CreateLessonVideo(request);
            return StatusCode(201, new
            {
                success = true, 
                message = "Tạo video bài học thành công",
                data = result

            });
        }

        [HttpPatch]
        [ValidateModel]
        [Route("{lessonVideoId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateLessonVideo([FromBody] UpdateLessonVideoRequest request, [FromRoute] Guid lessonVideoId)
        {
            var result = await lessonVideoService.UpdateLessonVideo(request, lessonVideoId);
            return Ok(new
            {
                success = true,
                message = "Cập nhật thông tin thành công",
                data = result
            });
        }
    }
}
