using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class LessonAssignmentRequest
    {
        [Required(ErrorMessage = "Tiêu đề bài tập là bắt buộc")]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tiêu đề không được phép chứa khoảng trắng")]
        public string Title { get; set; } = string.Empty;
        [Url(ErrorMessage = "Định dạng đường dẫn file không hợp lệ")]
        public string? FileUrl { get; set; }
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tên hiển thị file không được chỉ chứa khoảng trắng")]
        public string? FileTitle { get; set; }

        [Required(ErrorMessage = "Thông tin bài học là bắt buộc")]
        public Guid LessonId { get; set; }

        [Required(ErrorMessage = "Thứ tự bài tập là bắt buộc")]
        [Range(0, 1000, ErrorMessage = "Thứ tự bài tập phải lớn hơn 0")]
        public int OrderIndex { get; set; }
    }
}
