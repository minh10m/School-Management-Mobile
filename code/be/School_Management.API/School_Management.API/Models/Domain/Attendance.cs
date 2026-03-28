using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class Attendance
    {
        [Key]
        public Guid Id { get; set; }
        public Guid StudentClassYearId { get; set; }
        public string? Status { get; set; }
        public DateOnly Date { get; set; }
        public string? Note { get; set; }

        //Navigation properties
        [ForeignKey("StudentClassYearId")]
        public StudentClassYear? StudentClassYear { get; set; }

    }
}
