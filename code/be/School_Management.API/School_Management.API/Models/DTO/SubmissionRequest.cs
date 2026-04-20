using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class SubmissionRequest
    {
        [Required(ErrorMessage = "Mã bài tập là bắt buộc")]
        public Guid AssignmentId { get; set; }

        [Required(ErrorMessage = "File bài tập là bắt buộc")]
        public IFormFile File { get; set; } = null!;

        [Required(ErrorMessage = "Tiêu đề file bài tập là bắt buộc")]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tên hiển thị file không được chỉ chứa khoảng trắng")]
        public string FileTitle { get; set; } = string.Empty;
    }
}
