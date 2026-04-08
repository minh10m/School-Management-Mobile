using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;
using System.Security.Claims;

namespace School_Management.API.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService authService;

        public AuthController(IAuthService authService)
        {
            this.authService = authService;
        }

        //login
        [HttpPost]
        [Route("login")]
        [ValidateModel]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            var result = await authService.LoginAsync(loginRequest);
            return Ok(result);
        }

        //refreshToken
        [HttpPost]
        [Route("refresh")]
        [Authorize]
        [ValidateModel]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest refreshTokenRequest)
        {
            var result = await authService.RefreshTokenAsync(refreshTokenRequest);
            return Ok(result);
        }

        //Log out
        [HttpPost]
        [Route("logout")]
        [Authorize]
        [ValidateModel]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest refreshTokenRequest)
        {
            await authService.LogoutAsync(refreshTokenRequest);
            return Ok(new { message = "Đăng xuất thành công" });
        }

        // Change password
        [HttpPatch]
        [Route("change-password")]
        [Authorize]
        [ValidateModel]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest changePasswordRequest)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new
            {
                success = false,
                message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
            });

            await authService.ChangePasswordAsync(changePasswordRequest, userId.ToString());
            return Ok(new { Message = "Đổi mật khẩu thành công" });
        }
    }
}
