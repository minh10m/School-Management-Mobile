using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;

namespace School_Management.API.Controllers
{
    [Route("api/school-year-info")]
    [ApiController]
    public class SchoolYearInfosController : ControllerBase
    {
        private readonly ISchoolYearInfoService schoolYearInfoService;

        public SchoolYearInfosController(ISchoolYearInfoService schoolYearInfoService)
        {
            this.schoolYearInfoService = schoolYearInfoService;
        }

        [HttpPost]
        [ValidateModel]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateSchoolYearInfo([FromBody] SchoolYearInfoRequest request)
        {
            var result = await schoolYearInfoService.CreateSchoolYearInfo(request);
            return StatusCode(201, new
            {
                success = true,
                message = "Tạo thông tin năm học và kì học thành công",
                data = result
            });
        }

        [HttpPatch]
        [ValidateModel]
        [Route("{schoolYearInfoId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateSchoolYearInfo([FromBody] SchoolYearInfoRequest request, [FromRoute] Guid schoolYearInfoId)
        {
            var result = await schoolYearInfoService.UpdateSchoolYearInfo(request, schoolYearInfoId);
            return Ok(new
            {
                success = true,
                message = "Cập nhật thông tin thành công",
                data = result
            });
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetSchoolYearInfo()
        {
            var result = await schoolYearInfoService.GetSchoolYearInfo();
            return Ok(new
            {
                success = true,
                data = result
            });
        }
    }
}
