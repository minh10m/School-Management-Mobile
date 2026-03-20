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
        
        //Reset password
        [HttpPatch]
        [Route("{userId}/reset-password")]
        [ValidateModel]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminResetPassword([FromBody] ResetPasswordRequest resetPasswordRequest, [FromRoute] Guid userId)
        {
            await userService.ResetPassword(resetPasswordRequest, userId.ToString());
            return Ok(new { message = "Reset password successfully!"});
        }

        //Change status of ones account
        [HttpPatch]
        [Route("{userId}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ChangeStatusOfAccount([FromRoute] Guid userId)
        {
            var result = await userService.ChangeStatusOfAccount(userId.ToString());
            return Ok(result);
        }

        [HttpGet]
        [Route("{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUserById([FromRoute] Guid userId)
        {
            var result = await userService.GetUserById(userId.ToString());
            return Ok(result);
        }
    }
}
