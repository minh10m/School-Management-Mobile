using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class PostOrUpdateAssignmentRequest
    {
        [Required(ErrorMessage = "Tiêu đề bài tập là bắt buộc")]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tiêu đề không được phép chứa khoảng trắng")]
        public string? Title { get; set; }
        [Url(ErrorMessage = "Định dạng đường dẫn file không hợp lệ")]
        public string? FileUrl { get; set; }
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tên hiển thị file không được chỉ chứa khoảng trắng")]
        public string? FileTitle { get; set; }
        [Required(ErrorMessage = "Thời gian bắt đầu là bắt buộc")]
        public DateTimeOffset StartTime { get; set; }
        [Required(ErrorMessage = "Thời gian kết thúc là bắt buộc")]
        public DateTimeOffset FinishTime { get; set; }
        [Required(ErrorMessage = "Mã môn học là bắt buộc")]
        public Guid SubjectId { get; set; }
        [Required(ErrorMessage = "Mã lớp học là bắt buộc")]
        public Guid ClassYearId { get; set; }
    }
}
