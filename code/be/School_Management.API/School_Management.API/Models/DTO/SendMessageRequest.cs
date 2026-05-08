using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class SendMessageRequest
    {
        public Guid? ConversationId { get; set; }
        public Guid? ReceiverId { get; set; } 
        [Required(ErrorMessage = "Nội dung tin nhắn là bắt buộc")]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Nội dung tin nhắn không được chỉ chứa khoảng trắng")]
        public string Content { get; set; } = null!;
    }
}
