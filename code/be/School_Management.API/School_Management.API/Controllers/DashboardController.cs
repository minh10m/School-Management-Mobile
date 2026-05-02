using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.Services;
using System.Threading.Tasks;

namespace School_Management.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            this.dashboardService = dashboardService;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats([FromQuery] int schoolYear)
        {
            var result = await dashboardService.GetAdminDashboardStatsAsync(schoolYear);
            return Ok(result);
        }
    }
}
