using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class PostUpdateScheduleDetailRequest
    {
        [Required(ErrorMessage ="Teacher and subject is required")]
        public Guid TeacherSubjectId { get; set; }
        [Required(ErrorMessage = "DayOfWeek is required")]
        public DayOfWeek DayOfWeek { get; set; }
        [Required(ErrorMessage = "StartTime is required")]
        public TimeSpan StartTime { get; set; }
        //Finish Time = StartTime + 45 minutes
    }
}
