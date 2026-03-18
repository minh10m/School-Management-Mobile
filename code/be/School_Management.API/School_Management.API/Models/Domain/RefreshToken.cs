namespace School_Management.API.Models.Domain
{
    public class RefreshToken
    {
        public Guid Id { get; set; }
        
        // FK
        public Guid UserId { get; set; }
        public string TokenHash { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsRevoked { get; set; }
        public DateTime? RevokedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? ReplacedByToken { get; set; }

        // Navigation properties
        public AppUser User { get; set; }
    }
}
