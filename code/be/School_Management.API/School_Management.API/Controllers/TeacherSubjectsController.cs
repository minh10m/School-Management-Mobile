using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;

namespace School_Management.API.Controllers
{
    [Route("api/teacher-subjects")]
    [ApiController]
    public class TeacherSubjectsController : ControllerBase
    {
        private readonly ITeacherSubjectService teacherSubjectService;

        public TeacherSubjectsController(ITeacherSubjectService teacherSubjectService)
        {
            this.teacherSubjectService = teacherSubjectService;
        }

        [HttpPost]
        [ValidateModel]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignSubjectForTeacher([FromBody] TeacherSubjectRequest request)
        {
            var result = await teacherSubjectService.AssignSubjectForTeacher(request);
            return StatusCode(201, new
            {
                success = true,
                message = "Gán môn cho giáo viên thành công",
                data = result
            });
        }

        [HttpPatch]
        [ValidateModel]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateSubjectForTeacher([FromBody] UpdateTeacherSubjectRequest request)
        {
            var result = await teacherSubjectService.UpdateSubjectAfterAssignForTeacher(request);
            return Ok(result);
        }
    }
}
