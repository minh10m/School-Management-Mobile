using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;
using System.Security.Claims;

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

        //
        [HttpGet]
        [Route("{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUserById([FromRoute] Guid userId)
        {
            var result = await userService.GetUserById(userId.ToString());
            return Ok(result);
        }

        [HttpPatch]
        [Route("{userId}")]
        [ValidateModel]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserRequest updateUserRequest, [FromRoute] Guid userId)
        {
            var result = await userService.UpdateUser(updateUserRequest, userId.ToString());
            return Ok(result);
        }

        [HttpGet]
        [Route("me")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetMyProfileForAdmin()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new { Message = "Session is expired or revoked" });

            var result = await userService.GetMyProfileForAdmin(userId);
            return Ok(result);
        }

        [HttpPatch]
        [Route("me")]
        [ValidateModel]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateMyProfileForAdmin([FromBody] UpdateAdminRequest updateAdminRequest)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new { Message = "Session is expired or revoked" });

            var result = await userService.UpdateMyProfileForAdmin(updateAdminRequest, userId.ToString());
            return Ok(result);
        }

        [HttpPatch]
        [Route("{userId}/role")]
        [ValidateModel]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateRoleForUser([FromBody] ChangeRoleRequest updateRoleRequest, [FromRoute] Guid userId)
        {
            var userIdOfAdmin = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdOfAdmin != null && userIdOfAdmin.Trim() == userId.ToString().Trim())
            {
                return BadRequest(new { Message = "The role can not be changed by yourself, Admin" });
            }

            var result = await userService.UpdateRoleForUser(updateRoleRequest, userId.ToString());
            return Ok(result);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers(
            [FromQuery] string? filterOn, [FromQuery] string? filterQuery,
            [FromQuery] string? sortBy, [FromQuery] bool? isAscending, 
            [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var result = await userService.GetAllUser(filterOn, filterQuery, sortBy, isAscending ?? true, pageNumber, pageSize);
            return Ok(result);
        }

        [HttpPost]
        [ValidateModel]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest createUserRequest)
        {
            var result = await userService.CreateUser(createUserRequest);
            return StatusCode(201, result);
        }
    }
}
