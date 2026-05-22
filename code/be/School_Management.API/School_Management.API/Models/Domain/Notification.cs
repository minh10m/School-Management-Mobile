using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class Notification : BaseEntity
    {
        [Key]
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public bool IsPopup { get; set; } //Gía trị để nếu false thì nó được hiển thị popup, true thì thôi
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int SchoolYear { get; set; }
        public DateTimeOffset CreatedAt { get; set; }

        //Navigation properties
        [ForeignKey("UserId")]
        public AppUser User { get; set; } = null!;

    }
}
