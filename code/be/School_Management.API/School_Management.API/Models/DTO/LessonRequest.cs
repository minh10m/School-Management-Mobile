using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class LessonRequest
    {
        [Required(ErrorMessage = "Tên bài học là bắt buộc")]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tên bài học không được chỉ chứa khoảng trắng")]
        public string LessonName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Thông tin khóa học là bắt buộc")]
        public Guid CourseId { get; set; }

        [Required(ErrorMessage = "Thứ tự khóa học là bắt buộc")]
        [Range(1, 1000, ErrorMessage = "Thứ tự khóa học phải từ 1 trở lên")]
        public int OrderIndex { get; set; }
    }
}
