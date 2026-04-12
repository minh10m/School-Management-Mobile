using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class UpdateLessonVideoRequest
    {
        [Required(ErrorMessage = "Đường dẫn khóa học là bắt buộc")]
        [Url(ErrorMessage = "Định dạng đường dẫn file không hợp lệ")]
        public string Url { get; set; } = string.Empty;

        [Required(ErrorMessage = "IsPreview của video là thông tin bắt buộc")]
        public bool IsPreview { get; set; }

        [Required(ErrorMessage = "Tên video là bắt buộc")]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tên video không được chỉ chứa khoảng trắng")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Thời lượng video là bắt buộc")]
        [Range(1, 10000000, ErrorMessage = "Thời lượng video là giây và phải lớn hơn 0")]
        public int Duration { get; set; }

        [Required(ErrorMessage = "Thứ tự video là bắt buộc")]
        [Range(1, 1000, ErrorMessage = "Thứ tự video cần phải lớn hơn 1")]
        public int OrderIndex { get; set; }
    }
}
