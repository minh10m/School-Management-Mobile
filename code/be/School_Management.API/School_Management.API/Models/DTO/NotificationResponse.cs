namespace School_Management.API.Models.DTO
{
    public class NotificationResponse
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public bool IsPopup { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int SchoolYear { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}
