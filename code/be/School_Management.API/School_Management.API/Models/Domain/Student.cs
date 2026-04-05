using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class Student
    {
        [Key]
        public Guid Id { get; set; }

        //FK
        public Guid UserId { get; set; }

        //Navigation property
        [ForeignKey("UserId")]
        public AppUser? User { get; set; }
        public ICollection<StudentClassYear> StudentClassYears { get; set; } = new List<StudentClassYear>();
        public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
    }
}
