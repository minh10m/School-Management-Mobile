using Microsoft.AspNetCore.Identity;

namespace School_Management.API.Models.Domain
{
    public class AppUser : IdentityUser<Guid>
    {
        public string FullName { get; set; }
        public string Address { get; set; }
        public DateTimeOffset Birthday { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }

        // Navigation properties
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }
}
