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
            var result = await resultService.CreateResult(requests);
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
    }
}
