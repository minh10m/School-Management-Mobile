using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;
using System.Security.Claims;

namespace School_Management.API.Controllers
{
    [Route("api/results")]
    [ApiController]
    public class ResultsController : ControllerBase
    {
        private readonly IResultService resultService;

        public ResultsController(IResultService resultService)
        {
            this.resultService = resultService;
        }

        [HttpPost]
        [ValidateModel]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> CreateResult([FromBody] List<ResultRequest> requests)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdClaim, out var userGuid))
            {
                return Unauthorized(new { success = false, message = "Phiên đăng nhập hết hạn" });
            }
            var result = await resultService.CreateResult(requests, userGuid);
            return StatusCode(201, new
            {
                success = true,
                message = "Thêm điểm thành công",
                result
            });

        }

        [HttpPatch]
        [ValidateModel]
        [Route("{resultId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateResult([FromBody] UpdateResultRequest request, [FromRoute] Guid resultId)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdClaim, out var userGuid))
            {
                return Unauthorized(new { success = false, message = "Phiên đăng nhập hết hạn" });
            }
            var result = await resultService.UpdateResult(request, resultId, userGuid);
            return Ok(new
            {
                success = true,
                message = "Cập nhật thành công",
                data = result
            });
        }

        [HttpGet]
        [ValidateModel]
        [Route("student")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyResultForStudent([FromQuery] ResultOfStudentRequest request)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdClaim, out var userGuid))
            {
                return Unauthorized(new { success = false, message = "Phiên đăng nhập hết hạn" });
            }
            var result = await resultService.GetMyResultForStudent(request, userGuid);
            return Ok(new
            {
                success = true,
                message = "Lấy thông tin thành công",
                data = result
            });
        }

        [HttpGet]
        [ValidateModel]
        [Route("class/{classYearId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetResultOfAllStudentInClass([FromQuery] ResultOfAllStudentRequest request, [FromRoute] Guid classYearId)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdClaim, out var userGuid))
            {
                return Unauthorized(new { success = false, message = "Phiên đăng nhập hết hạn" });
            }
            var result = await resultService.GetResultOfAllStudentInClass(request, classYearId, userGuid);
            return Ok(new
            {
                success = true,
                message = "Lấy thông tin thành công",
                data = result
            });
        }

        [HttpGet]
        [ValidateModel]
        [Route("class/{classYearId}/student/{studentId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetResultOfOneStudentForTeacher([FromQuery] ResultOfAllStudentRequest request, [FromRoute] Guid classYearId, [FromRoute] Guid studentId)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdClaim, out var userGuid))
            {
                return Unauthorized(new { success = false, message = "Phiên đăng nhập hết hạn" });
            }
            var result = await resultService.GetResultOfOneStudentForTeacher(request, classYearId, studentId, userGuid);
            return Ok(new
            {
                success = true,
                message = "Lấy thông tin thành công",
                data = result
            });
        }
    }
}
