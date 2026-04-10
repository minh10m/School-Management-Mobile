using System.Text.Json.Serialization;

namespace School_Management.API.Models.DTO
{
    public class UserListResponse
    {
        public Guid UserId { get; set; }
        public string? UserName { get; set; }
        public string? FullName { get; set; }
        public DateTimeOffset? LockoutEnd { get; set; }
        [JsonPropertyName("role")]
        public string? Role { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public bool IsLocked => LockoutEnd.HasValue && LockoutEnd > DateTimeOffset.UtcNow;
    }
}
