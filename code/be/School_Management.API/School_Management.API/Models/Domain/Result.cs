using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class Result
    {
        [Key]
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public float Value { get; set; }
        public Guid StudentId { get; set; }
        public Guid SubjectId { get; set; }
        public int Term { get; set; }
        public int Weight { get; set; }
        public int SchoolYear { get; set; }

        //Navigation properties
        [ForeignKey("StudentId")]
        public Student Student { get; set; } = null!;

        [ForeignKey("SubjectId")]
        public Subject Subject { get; set; } = null!;
    }
}
