using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class StudentClassYear
    {
        
        [Key]
        public Guid StudentClassYearId { get; set; }
        public Guid StudentId { get; set; }
        public Guid ClassYearId { get; set; }

        //Navigation properties
        [ForeignKey("StudentId")]
        public Student? Student { get; set; }

        [ForeignKey("ClassYearId")]
        public ClassYear? ClassYear { get; set; }
    }
}
