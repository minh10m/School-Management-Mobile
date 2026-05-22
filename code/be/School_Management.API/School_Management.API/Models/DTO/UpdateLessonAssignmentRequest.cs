using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class UpdateLessonAssignmentRequest
    {
        [Required(ErrorMessage = "Tiêu đề bài tập là bắt buộc")]
        public string Title { get; set; } = string.Empty;
        [Url(ErrorMessage = "Định dạng đường dẫn file không hợp lệ")]
        public string? FileUrl { get; set; }
        public string? FileTitle { get; set; }

        [Required(ErrorMessage = "Mô tả bài tập là bắt buộc")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Thứ tự bài tập là bắt buộc")]
        [Range(0, 1000, ErrorMessage = "Thứ tự bài tập phải lớn hơn 0")]
        public int OrderIndex { get; set; }
    }
}
