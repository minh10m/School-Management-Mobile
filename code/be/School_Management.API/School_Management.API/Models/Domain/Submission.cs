using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Principal;

namespace School_Management.API.Models.Domain
{
    public class Submission
    {
        [Key]
        public Guid Id { get; set; }
        public DateTimeOffset TimeSubmit { get; set; }
        public string? Status { get; set; }
        public Guid AssignmentId { get; set; }
        public string FileTitle { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public Guid StudentId { get; set; }
        public float? Score { get; set; }

        //Navigation properties
        [ForeignKey("AssignmentId")]
        public Assignment Assignment { get; set; } = null!;

        [ForeignKey("StudentId")]
        public Student Student { get; set; } = null!;
    }
}
