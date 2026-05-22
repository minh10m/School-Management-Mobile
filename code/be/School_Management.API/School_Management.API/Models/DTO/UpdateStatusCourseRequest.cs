using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class UpdateStatusCourseRequest
    {
        [Required(ErrorMessage = "Trạng thái khóa học là bắt buộc")]
        public string Status { get; set; } = string.Empty;
    }
}
