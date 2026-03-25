using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class ScheduleDetail
    {
        [Key]
        public Guid Id { get; set; }
        public Guid ScheduleId { get; set; }
        public Guid TeacherSubjectId { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan FinishTime { get; set; }

        //Navigation properties

        [ForeignKey("ScheduleId")]
        public Schedule? Schedule { get; set; }

        [ForeignKey("TeacherSubjectId")]
        public TeacherSubject? TeacherSubject { get; set; }
    }
}
