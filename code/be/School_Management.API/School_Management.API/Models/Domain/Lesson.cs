using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class Lesson
    {
        [Key]
        public Guid Id { get; set; }
        public string LessonName { get; set; } = string.Empty;
        public Guid CourseId { get; set; }
        public int OrderIndex { get; set; }

        //Navigation properties
        [ForeignKey("CourseId")]
        public Course Course { get; set; } = null!;
        public ICollection<LessonVideo> LessonVideos { get; set; } = new List<LessonVideo>();
        public ICollection<LessonAssignment> LessonAssignments { get; set; } = new List<LessonAssignment>();
    }
}
