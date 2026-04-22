using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    [Table("LessonAssignment")]
    public class LessonAssignment
    {
        [Key]
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string FileTitle { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? PublicId { get; set; } 
        public Guid LessonId { get; set; }
        public int OrderIndex { get; set; }
        //Navigation properties
        [ForeignKey("LessonId")]
        public Lesson Lesson { get; set; } = null!;
    }
}
