using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IAuthService
    {
        public Task<AuthResponse> LoginAsync(LoginRequest loginRequest);
        public Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest refreshTokenRequest);
        public Task LogoutAsync(RefreshTokenRequest refreshTokenRequest);
        public Task ChangePasswordAsync(ChangePasswordRequest changePasswordRequest, string? UserId);
    }
}
