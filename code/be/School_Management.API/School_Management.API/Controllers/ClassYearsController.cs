using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;
using System.Security.Claims;

namespace School_Management.API.Controllers
{
    [Route("api/class-years")]
    [ApiController]
    public class ClassYearsController : ControllerBase
    {
        private readonly IClassYearService classYearService;

        public ClassYearsController(IClassYearService classYearService)
        {
            this.classYearService = classYearService;
        }

        [HttpPost]
        [ValidateModel]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateClassYear([FromBody] PostOrUpdateClassYearReq req)
        {
            var result = await classYearService.CreateClassYear(req);
            return StatusCode(201, result);
        }

        [HttpPatch]
        [ValidateModel]
        [Route("{classYearId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateClassYear([FromBody] PostOrUpdateClassYearReq req, [FromRoute] Guid classYearId)
        {
            var result = await classYearService.UpdateClassYear(req, classYearId);
            return Ok(result);
        }

        [HttpGet]
        [ValidateModel]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllClass([FromQuery] ClassYearFilterRequest request)
        {
            if (request.SortBy == null) request.SortBy = "ClassName";
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;
            var result = await classYearService.GetAllClass(request);
            return Ok(result);
        }

        [HttpGet]
        [Route("{classYearId}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetClassYearById([FromRoute] Guid classYearId)
        {
            var result = await classYearService.GetClassYearById(classYearId);
            return Ok(result);
        }

        [HttpGet]
        [Route("teaching")]
        [ValidateModel]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetMyClassIsTeachingForTeacher([FromQuery] ClassOfTeacherFilterRequest request)
        {
            if (request.SortBy == null) request.SortBy = "ClassName";
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new { Message = "Phiên đăng nhập hết hạn" });
            var result = await classYearService.GetMyClassIsTeachingForTeacher(request, Guid.Parse(userId));
            return Ok(result);
        }

        [HttpGet]
        [Route("by-teacher/{teacherId}")]
        [ValidateModel]
        [Authorize]
        public async Task<IActionResult> GetAllClassIsTeachingByTeacher([FromQuery] ClassOfTeacherFilterRequest request, [FromRoute] Guid teacherId)
        {
            if (request.SortBy == null) request.SortBy = "ClassName";
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;
            var result = await classYearService.GetAllClassIsTeachingByTeacher(request, teacherId);
            return Ok(result);
        }
    }
}
