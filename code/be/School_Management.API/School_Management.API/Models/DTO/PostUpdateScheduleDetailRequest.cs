using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class PostUpdateScheduleDetailRequest
    {
        [Required]
        public Guid TeacherSubjectId { get; set; }
        [Required]
        public DayOfWeek DayOfWeek { get; set; }
        [Required]
        public TimeSpan StartTime { get; set; }
        //Finish Time = StartTime + 45 minutes
    }
}
