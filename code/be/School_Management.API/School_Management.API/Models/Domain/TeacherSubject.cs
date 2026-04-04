using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class TeacherSubject
    {
        [Key]
        public Guid TeacherSubjectId { get; set; }
        public Guid TeacherId { get; set; }
        public Guid SubjectId { get; set; }

        // Navigation properties
        [ForeignKey("TeacherId")]
        public Teacher? Teacher { get; set; }

        [ForeignKey("SubjectId")]
        public Subject? Subject { get; set; }
        public ICollection<ScheduleDetail> ScheduleDetails { get; set; } = new List<ScheduleDetail>();
        public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    }
}
