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
        public ClassYear? ClassYear { get; set; }
        public ICollection<TeacherSubject> TeacherSubjects { get; set; } = new List<TeacherSubject>();

    }
}
