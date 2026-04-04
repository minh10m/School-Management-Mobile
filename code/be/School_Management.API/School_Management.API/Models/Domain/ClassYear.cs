using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class ClassYear
    {
        [Key]
        public Guid Id { get; set; }
        public int Grade { get; set; }
        public string? ClassName { get; set; }
        public int SchoolYear { get; set; }

        //FK
        public Guid? HomeRoomId { get; set; }

        //Navigation properties
        [ForeignKey("HomeRoomId")]
        public Teacher? Teacher { get; set; }

        public ICollection<StudentClassYear> StudentClassYears { get; set; } = new List<StudentClassYear>();
        public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
        public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();

    }
}
