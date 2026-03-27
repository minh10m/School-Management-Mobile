using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.Models.DTO;
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
        public async Task<IActionResult> GetAllRoles([FromQuery] RoleFilterRequest request)
        {
            if (request.SortBy == null) request.SortBy = "Name";
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;
            var result = await roleService.GetAllRoles(request);
            return Ok(result);
        }

        [HttpGet]
        [Route("{roleId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetRoleById([FromRoute] Guid roleId)
        {
            var result = await roleService.GetRoleById(roleId.ToString());
            return Ok(result);
        }
    }
}
