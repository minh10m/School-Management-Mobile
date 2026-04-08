using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class SubmissionRequest
    {
        [Required(ErrorMessage = "Mã bài tập là bắt buộc")]
        public Guid AssignmentId { get; set; }

        [Required(ErrorMessage = "Đường dẫn file bài tập là bắt buộc")]
        [Url(ErrorMessage = "Định dạng đường dẫn file không hợp lệ")]
        public string FileUrl { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tiêu đề file bài tập là bắt buộc")]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tên hiển thị file không được chỉ chứa khoảng trắng")]
        public string FileTitle { get; set; } = string.Empty;
    }
}
