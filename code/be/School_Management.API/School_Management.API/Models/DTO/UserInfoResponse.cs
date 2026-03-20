namespace School_Management.API.Models.DTO
{
    public class UserInfoResponse
    {
        public Guid UserId { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? FullName { get; set; }
        public string? Address { get; set; }
        public DateTimeOffset Birthday { get; set; }
        public string? Role { get; set; }
        public DateTimeOffset? LockoutEnd { get; set; }
        public bool IsLocked => LockoutEnd.HasValue && LockoutEnd > DateTimeOffset.UtcNow;

    }
}
