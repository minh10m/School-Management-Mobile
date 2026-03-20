using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;

namespace School_Management.API.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService userService;

        public UsersController(IUserService userService)
        {
            this.userService = userService;
        }

        [HttpPatch]
        [Route("{userId}/reset-password")]
        [ValidateModel]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminResetPassword([FromBody] ResetPasswordRequestDTO resetPasswordRequest, [FromRoute] Guid userId)
        {
            await userService.ResetPassword(resetPasswordRequest, userId.ToString());
            return Ok(new { message = "Reset password successfully!"});
        }
    }
}
