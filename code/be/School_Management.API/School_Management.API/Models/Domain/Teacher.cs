using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class Teacher
    {
        [Key]
        public Guid Id { get; set; }
        
        // FK
        public Guid UserId { get; set; }

        // Navigation property

        [ForeignKey("UserId")]
        public AppUser? User { get; set; }
        public ICollection<ClassYear> ClassYears { get; set; } = new List<ClassYear>();
        public ICollection<TeacherSubject> TeacherSubjects { get; set; } = new List<TeacherSubject>();
        public ICollection<ExamScheduleDetail> ExamScheduleDetails { get; set; } = new List<ExamScheduleDetail>();

    }
}
