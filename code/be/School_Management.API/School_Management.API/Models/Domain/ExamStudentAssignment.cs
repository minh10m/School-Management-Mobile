using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class ExamStudentAssignment
    {
        public Guid Id { get; set; }
        public Guid ExamScheduleDetailId { get; set; }
        public Guid StudentId { get; set; }
        public string? IdentificationNumber { get; set; }

        //Navigation properties
        [ForeignKey("ExamScheduleDetailId")]
        public ExamScheduleDetail ExamScheduleDetail { get; set; } = null!;

        [ForeignKey("StudentId")]
        public Student Student { get; set; } = null!;
    }
}
