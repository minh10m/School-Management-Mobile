using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class CreateCourseRequest
    {
        [Required(ErrorMessage = "Tên khóa học là bắt buộc")]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tên khóa học không được chỉ chứa khoảng trắng")]
        public string CourseName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Giá tiền là bắt buộc")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Thông tin môn học là bắt buộc")]
        public Guid SubjectId { get; set; }

        [Required(ErrorMessage = "Mô tả khóa học là bắt buộc")]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Mô tả khóa học không được chỉ chứa khoảng trắng")]
        public string Description { get; set; } = string.Empty;
    }
}
