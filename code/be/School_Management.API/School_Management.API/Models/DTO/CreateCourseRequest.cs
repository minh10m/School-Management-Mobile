using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class CreateCourseRequest
    {
        [Required(ErrorMessage = "Tên khóa học là bắt buộc")]
        public string CourseName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Giá tiền là bắt buộc")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Thông tin môn học là bắt buộc")]
        public Guid SubjectId { get; set; }

        [Required(ErrorMessage = "Mô tả khóa học là bắt buộc")]
        public string Description { get; set; } = string.Empty;
    }
}
