using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class Conversation : BaseEntity
    {
        [Key]
        public Guid Id { get; set; }
        public string? ConversationName { get; set; }
        public string? ConversationAvatarUrl { get; set; }
        public bool IsGroup { get; set; }
        public string? PublicId { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset LastUpdatedAt { get; set; }
        //Navigation properties
        public ICollection<UserConversation> UserConversations { get; set; } = new List<UserConversation>();
        public ICollection<Message> Messages { get; set; } = new List<Message>();

    }
}
