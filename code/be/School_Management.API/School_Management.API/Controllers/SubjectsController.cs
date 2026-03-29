using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;

namespace School_Management.API.Controllers
{
    [Route("api/subjects")]
    [ApiController]
    public class SubjectsController : ControllerBase
    {
        private readonly ISubjectService subjectService;

        public SubjectsController(ISubjectService subjectService)
        {
            this.subjectService = subjectService;
        }

        [HttpPost]
        [ValidateModel]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateSubject([FromBody] PostOrUpdateSubjectRequest request)
        {
            var result = await subjectService.CreateSubject(request);
            return StatusCode(201, result);
        }

        [HttpPatch]
        [ValidateModel]
        [Route("{subjectId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateSubject([FromRoute] Guid subjectId, [FromBody] PostOrUpdateSubjectRequest request)
        {
            var result = await subjectService.UpdateSubject(request, subjectId);
            return Ok(result);
        }
    }
}
