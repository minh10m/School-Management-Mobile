using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class UserConversation 
    {
        [Key]
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public int UnReadCount { get; set; }
        public Guid ConversationId { get; set; }

        //Navigation properties
        [ForeignKey("UserId")]
        public AppUser User { get; set; } = null!;

        [ForeignKey("ConversationId")]
        public Conversation Conversation { get; set; } = null!;
    }
}
