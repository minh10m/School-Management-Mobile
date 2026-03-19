using School_Management.API.Models.Domain;

namespace School_Management.API.Repositories
{
    public interface IAuthRepository
    {
        public Task RevokeAllUserToken(Guid userId);
        public Task AddRefreshToken(RefreshToken refreshToken);
        public Task<RefreshToken?> GetRefreshTokenByValue(string refreshToken);
        public Task UpdateRefreshToken(RefreshToken refreshToken);
    }
}
