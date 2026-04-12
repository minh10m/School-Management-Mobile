using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class Course
    {
        [Key]
        public Guid Id { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public Guid TeacherSubjectId { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? PublishedAt { get; set; }
        public string Description { get; set; } = string.Empty;

        //Navigation properties
        [ForeignKey("TeacherSubjectId")]
        public TeacherSubject TeacherSubject { get; set; } = null!;
        public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
    }
}
