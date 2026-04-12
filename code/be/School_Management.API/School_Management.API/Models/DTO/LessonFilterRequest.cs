using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class LessonFilterRequest : BaseRequestSecond
    {
        [Required(ErrorMessage = "Thông tin khóa học là bắt buộc")]
        public Guid? CourseId { get; set; }
    }
}
