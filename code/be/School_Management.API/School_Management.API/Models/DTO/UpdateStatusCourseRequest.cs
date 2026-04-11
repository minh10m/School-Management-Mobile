using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class UpdateStatusCourseRequest
    {
        [Required(ErrorMessage = "Trạng thái khóa học là bắt buộc")]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Trạng thái khóa học không được chỉ chứa khoảng trắng")]
        public string Status { get; set; } = string.Empty;
    }
}
