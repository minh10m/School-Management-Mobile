using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class CourseAssignmentFilterRequest : BaseRequestSecond
    {
        [Required(ErrorMessage = "Thông tin bài học là bắt buộc")]
        public Guid? LessonId { get; set; }
    }
}
