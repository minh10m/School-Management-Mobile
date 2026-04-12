using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class LessonVideo
    {
        [Key]
        public Guid Id { get; set; }
        public string Url { get; set; } = string.Empty;
        public bool IsPreview { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid LessonId { get; set; }
        public int Duration { get; set; }
        public int OrderIndex { get; set; }

        //Navigation properties
        [ForeignKey("LessonId")]
        public Lesson Lesson { get; set; } = null!;
    }
}
