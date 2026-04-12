using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class CourseFilterRequestAdmin : BaseRequestSecond
    {
        [Required(ErrorMessage = "Trạng thái khóa học là bắt buộc")]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Trạng thái khóa học không được chỉ chứa khoảng trắng")]
        public string Status { get; set; } = string.Empty;

        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tên khóa học không được chỉ chứa khoảng trắng")]
        public string CourseName { get; set; } = string.Empty;
    }
}
