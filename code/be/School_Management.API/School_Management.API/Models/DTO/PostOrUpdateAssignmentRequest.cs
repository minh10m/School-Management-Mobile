using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class PostOrUpdateAssignmentRequest
    {
        [Required(ErrorMessage = "Tiêu đề bài tập là bắt buộc")]
        public string? Title { get; set; }
        public IFormFile? File { get; set; }
        public string? FileTitle { get; set; }
        [Required(ErrorMessage = "Thời gian bắt đầu là bắt buộc")]
        public DateTimeOffset StartTime { get; set; }

        [Required(ErrorMessage = "Mô tả bài tập là bắt buộc")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Thời gian kết thúc là bắt buộc")]
        public DateTimeOffset FinishTime { get; set; }
        [Required(ErrorMessage = "Mã môn học là bắt buộc")]
        public Guid SubjectId { get; set; }
        [Required(ErrorMessage = "Mã lớp học là bắt buộc")]
        public Guid ClassYearId { get; set; }
    }
}
