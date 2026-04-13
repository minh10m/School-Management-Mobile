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
    }
}
