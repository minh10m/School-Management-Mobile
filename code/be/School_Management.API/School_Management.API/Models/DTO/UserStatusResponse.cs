namespace School_Management.API.Models.DTO
{
    public class UserStatusResponse
    {
        public Guid UserId { get; set; }
        public DateTimeOffset? LockoutEnd { get; set; }
        public bool IsLocked => LockoutEnd.HasValue && LockoutEnd > DateTimeOffset.UtcNow;
        public string Message { get; set; }
    }
}
