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
    }
}
