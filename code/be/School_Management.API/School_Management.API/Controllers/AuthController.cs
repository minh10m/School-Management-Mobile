using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;

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

        [HttpPost]
        [Route("login")]
        [ValidateModel]
        public async Task<IActionResult> Login([FromBody] LoginRequestDTO loginRequest)
        {
            var result = await authService.LoginAsync(loginRequest);
            return Ok(result);
        }

        [HttpPost]
        [Route("refresh")]
        [Authorize]
        [ValidateModel]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDTO refreshTokenRequest)
        {
            var result = await authService.RefreshTokenAsync(refreshTokenRequest);
            return Ok(result);
        }

        [HttpPost]
        [Route("logout")]
        [Authorize]
        [ValidateModel]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenRequestDTO refreshTokenRequest)
        {
            await authService.LogoutAsync(refreshTokenRequest);
            return Ok(new { message = "Logged out successfully" });
        }
    }
}
