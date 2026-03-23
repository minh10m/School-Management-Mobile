using School_Management.API.Models.Domain;

namespace School_Management.API.Services
{
    public interface ITokenService
    {
        public string GenerateAccessToken(AppUser user, IList<string> Roles);
        public string GenerateRefreshToken();
    }
}
