using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class LessonAssignmentRequest
    {
        [Required(ErrorMessage = "Tiêu đề bài tập là bắt buộc")]
        public string Title { get; set; } = string.Empty;

        public IFormFile? File { get; set; }
        public string? FileTitle { get; set; }

        [Required(ErrorMessage = "Mô tả bài tập là bắt buộc")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Thông tin bài học là bắt buộc")]
        public Guid LessonId { get; set; }

        [Required(ErrorMessage = "Thứ tự bài tập là bắt buộc")]
        [Range(0, 1000, ErrorMessage = "Thứ tự bài tập phải lớn hơn 0")]
        public int OrderIndex { get; set; }
    }
}
