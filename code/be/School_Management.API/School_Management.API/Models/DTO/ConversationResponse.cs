namespace School_Management.API.Models.DTO
{
    public class ConversationResponse
    {
        public Guid ConversationId { get; set; }
        public string DisplayName { get; set; } = null!;
        public int UnReadCount { get; set; }
        public DateTimeOffset LastUpdatedAt { get; set; }
        public bool IsGroup { get; set; }
        public string? AvatarUrl { get; set; }
        public string? LastMessage { get; set; }
    }
}
