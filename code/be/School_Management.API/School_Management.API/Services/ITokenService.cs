using School_Management.API.Models.Domain;

namespace School_Management.API.Services
{
    public interface ITokenService
    {
        public string GenerateAccessToken(AppUser user, List<string> Role);
        public string GenerateRefreshToken();
    }
}
