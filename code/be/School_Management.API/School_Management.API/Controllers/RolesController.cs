using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.Services;

namespace School_Management.API.Controllers
{
    [Route("api/roles")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly IRoleService roleService;

        public RolesController(IRoleService roleService)
        {
            this.roleService = roleService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllRoles([FromQuery] string? filterOn, [FromQuery] string? filterQuery, [FromQuery] string? sortBy, [FromQuery] bool? isAscending = true,
            [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 15)
        {
            var result = await roleService.GetAllRoles(filterOn, filterQuery, sortBy, isAscending, pageNumber, pageSize);
            return Ok(result);
        }
    }
}
