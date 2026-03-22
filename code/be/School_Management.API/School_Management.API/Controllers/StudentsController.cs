using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.Services;

namespace School_Management.API.Controllers
{
    [Route("api/students")]
    [ApiController]
    public class StudentsController : ControllerBase
    {
        private readonly IStudentService studentService;

        public StudentsController(IStudentService studentService)
        {
            this.studentService = studentService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllStudent(
            [FromQuery] string? filterOn, [FromQuery] string? filterQuery,
            [FromQuery] string? sortBy, [FromQuery] bool? isAscending,
            [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var result = await studentService.GetAllStudent(filterOn, filterQuery, sortBy, isAscending, pageNumber, pageSize);
            return Ok(result);
        }

    }
}
