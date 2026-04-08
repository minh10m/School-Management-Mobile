using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.Domain
{
    public class Subject
    {
        [Key]
        public Guid Id { get; set; }
        public string? SubjectName { get; set; }
        public int MaxPeriod { get; set; }

        //Navigation properties
        public ICollection<TeacherSubject> TeacherSubjects { get; set; } = new List<TeacherSubject>();
        public ICollection<Result> Results { get; set; } = new List<Result>();
    }
}
