using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;

namespace School_Management.API.Controllers
{
    [Route("api/fee-details")]
    [ApiController]
    public class FeeDetailsController : ControllerBase
    {
        private readonly IFeeDetailService feeDetailService;

        public FeeDetailsController(IFeeDetailService feeDetailService)
        {
            this.feeDetailService = feeDetailService;
        }

        [HttpPost]
        [ValidateModel]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateFeeDetailForStudent([FromBody] FeeDetailRequest request)
        {
            var result = await feeDetailService.CreateFeeDetailForStudent(request);
            return StatusCode(201, new
            {
                success = true,
                message = "Tạo mới phí chi tiết cho học sinh thành công",
                data = result
            });
        }
    }
}
