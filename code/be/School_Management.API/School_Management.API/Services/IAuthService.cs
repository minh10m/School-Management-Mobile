using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IAuthService
    {
        public Task<AuthResponse> LoginAsync(LoginRequestDTO loginRequest);
        public Task<AuthResponse> RefreshTokenAsync(string refreshToken);
        public Task LogoutAsync(string refreshToken);
        public Task ChangePassword(ChangePasswordRequestDTO changePasswordRequest);
    }
}
