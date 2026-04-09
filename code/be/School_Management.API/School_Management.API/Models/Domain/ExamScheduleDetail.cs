using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class ExamScheduleDetail
    {
        [Key]
        public Guid Id { get; set; }
        public Guid ExamScheduleId { get; set; }
        public Guid? TeacherId { get; set; }
        public Guid SubjectId { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan FinishTime { get; set; }
        public DateOnly Date { get; set; }
        public string RoomName { get; set; } = string.Empty;

        //Navigation properties
        [ForeignKey("ExamScheduleId")]
        public ExamSchedule ExamSchedule { get; set; } = null!;

        [ForeignKey("TeacherId")]
        public Teacher Teacher { get; set; } = null!;

        [ForeignKey("SubjectId")]
        public Subject Subject { get; set; } = null!;

        public ICollection<ExamStudentAssignment> ExamStudentAssignments { get; set; } = new List<ExamStudentAssignment>();

    }
}
