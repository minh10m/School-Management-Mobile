using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class PostUpdateScheduleDetailRequest
    {
        [Required(ErrorMessage ="Giáo viên và môn học là bắt buộc")]
        public Guid TeacherSubjectId { get; set; }
        [Required(ErrorMessage = "Ngày trong tuần là bắt buộc")]
        public DayOfWeek DayOfWeek { get; set; }
        [Required(ErrorMessage = "Thời gian bắt đầu là bắt buộc")]
        public TimeSpan StartTime { get; set; }
        //Finish Time = StartTime + 45 minutes
    }
}
