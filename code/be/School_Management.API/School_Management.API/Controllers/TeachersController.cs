using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.Services;

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
        //[Authorize]
        public async Task<IActionResult> GetAllTeacher(
            [FromQuery] string? filterOn, [FromQuery] string? filterQuery,
            [FromQuery] string? sortBy = "FullName", [FromQuery] bool? isAscending = true,
            [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var result = await teacherService.GetAllTeacher(filterOn, filterQuery, sortBy, isAscending ?? true, pageNumber, pageSize);
            return Ok(result);
        }

        [HttpGet]
        [Route("{teacherId}")]
        //[Authorize]
        public async Task<IActionResult> GetTeacherById([FromRoute] Guid teacherId)
        {
            var result = await teacherService.GetTeacherById(teacherId);
            return Ok(result);
        }
    }
}
