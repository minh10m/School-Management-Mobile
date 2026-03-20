using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IAuthService
    {
        public Task<AuthResponse> LoginAsync(LoginRequestDTO loginRequest);
        public Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequestDTO refreshTokenRequest);
        public Task LogoutAsync(RefreshTokenRequestDTO refreshTokenRequest);
        public Task ChangePasswordAsync(ChangePasswordRequestDTO changePasswordRequest);
    }
}
