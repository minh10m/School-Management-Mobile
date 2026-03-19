using School_Management.API.Models.Domain;

namespace School_Management.API.Models.DTO
{
    public class AuthResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTimeOffset AccessTokenExpireTime { get; set; } 

        public Guid? UserId { get; set; }
        public string? FullName { get; set; } = string.Empty;
        public string? Email { get; set; } = string.Empty;

        public string? Role { get; set; } = string.Empty;
    }
}
