
using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;

namespace School_Management.API.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly ApplicationDbContext context;

        public AuthRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public async Task AddRefreshToken(RefreshToken refreshToken)
        {
            var expireTokens = await context.RefreshTokens
                .Where(t => t.UserId == refreshToken.UserId && (t.ExpiresAt < DateTime.UtcNow ||
                t.IsRevoked))
                .ToListAsync();

            context.RemoveRange(expireTokens);

            context.RefreshTokens.Add(refreshToken);
            await context.SaveChangesAsync();
        }

        public async Task RevokeAllUserToken(Guid userId)
        {
            var tokens = await context.RefreshTokens
                .Where(t => t.UserId == userId && !t.IsRevoked)
                .ToListAsync();
            foreach(var token in tokens)
            {
                token.IsRevoked = true;
            }

            await context.SaveChangesAsync();
        }
    }
}
