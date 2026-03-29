using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;

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
            var result = await classYearService.GetAllClass(request);
            return Ok(result);
        }
    }
}
