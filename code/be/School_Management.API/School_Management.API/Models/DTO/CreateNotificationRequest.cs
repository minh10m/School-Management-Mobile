using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class CreateNotificationRequest
    {
        [Required(ErrorMessage = "Thông tin người dùng là bắt buộc")]
        public Guid UserId { get; set; }

        [Required(ErrorMessage = "Nội dung thông báo là bắt buộc")]
        public string Content { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tiêu đề thông báo là bắt buộc")]
        public string Tiltle { get; set; } = string.Empty;

        [Required(ErrorMessage = "Loại thông báo là bắt buộc")]
        public string Type { get; set; } = string.Empty;

    }
}
