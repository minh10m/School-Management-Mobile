using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class AIChatHistory
    {
        [Key]
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Role { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }

        //Navigation Properties
        [ForeignKey("UserId")]
        public AppUser User { get; set; } = null!;
    }
}
