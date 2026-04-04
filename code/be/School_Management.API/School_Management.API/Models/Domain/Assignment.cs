using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class Assignment
    {
        [Key]
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? FileUrl { get; set; }
        public string? FileTitle { get; set; }
        public DateTimeOffset StartTime { get; set; }
        public DateTimeOffset FinishTime { get; set; }
        public Guid TeacherSubjectId { get; set; }
        public Guid ClassYearId { get; set; }

        //Navigation properties
        [ForeignKey("TeacherSubjectId")]
        public TeacherSubject? TeacherSubject { get; set; }

        [ForeignKey("ClassYearId")]
        public ClassYear? ClassYear { get; set; }
    }
}
