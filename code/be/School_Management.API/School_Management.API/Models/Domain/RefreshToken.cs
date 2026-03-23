using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class RefreshToken
    {
        [Key]
        public Guid Id { get; set; }
        
        // FK
        public Guid UserId { get; set; }
        public string? TokenHash { get; set; }
        public DateTimeOffset ExpiresAt { get; set; }
        public bool IsRevoked { get; set; }
        public DateTimeOffset? RevokedAt { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public string? ReplacedByToken { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public AppUser? User { get; set; }
    }
}
