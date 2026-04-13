using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;

namespace School_Management.API.Controllers
{
    [Route("api/fees")]
    [ApiController]
    public class FeesController : ControllerBase
    {
        private readonly IFeeService feeService;

        public FeesController(IFeeService feeService)
        {
            this.feeService = feeService;
        }

        [HttpPost]
        [ValidateModel]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateFee([FromBody] FeeRequest request)
        {
            var result = await feeService.CreateFee(request);
            return StatusCode(201, new
            {
                success = true,
                message = "Tạo phí thành công",
                data = result
            });
        }

        [HttpGet]
        [ValidateModel]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllFee([FromQuery] FeeFilterRequest request)
        {
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;
            var result = await feeService.GetAllFee(request);
            return Ok(new
            {
                success = true,
                data = result
            });
        }
    }
}
