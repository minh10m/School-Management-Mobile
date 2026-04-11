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

        [HttpGet("teacher/{teacherId}")]
        [Authorize]
        public async Task<IActionResult> GetTeacherSubjects([FromRoute] Guid teacherId)
        {
            var result = await teacherSubjectService.GetTeacherSubjects(teacherId);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTeacherSubject([FromRoute] Guid id)
        {
            var result = await teacherSubjectService.DeleteTeacherSubject(id);
            if (!result) return NotFound(new { success = false, message = "Không tìm thấy gán môn này" });
            return Ok(new { success = true, message = "Xóa gán môn thành công" });
        }
    }
}
