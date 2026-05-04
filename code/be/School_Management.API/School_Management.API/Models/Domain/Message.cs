using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class Message
    {
        [Key]
        public Guid Id { get; set; }
        public Guid SenderId { get; set; }
        public Guid ConversationId { get; set; }
        public string Content { get; set; } = null!;
        public DateTimeOffset CreatedAt { get; set; }

        //Navigation properties
        [ForeignKey("SenderId")]
        public AppUser User { get; set; } = null!;

        [ForeignKey("ConversationId")]
        public Conversation Conversation { get; set; } = null!;
    }
}
