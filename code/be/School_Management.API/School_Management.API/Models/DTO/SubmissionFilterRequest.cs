using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class SubmissionFilterRequest : BaseRequestSecond
    {
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Trạng thái không được chỉ chứa khoảng trắng")]
        public string? Status { get; set; }

        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tên hiển thị file không được chỉ chứa khoảng trắng")]
        public string? FileTitle { get; set; }

        [Required(ErrorMessage = "Mã bài tập là bắt buộc")]
        public Guid AssignmentId { get; set; }
    }
}
