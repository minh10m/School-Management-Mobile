using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class Fee
    {
        [Key]
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTimeOffset DueDate { get; set; }
        public Guid ClassYearId { get; set; }
        public int SchoolYear { get; set; }

        //Navigation properties
        [ForeignKey("ClassYearId")]
        public ClassYear ClassYear { get; set; } = null!;
        public ICollection<FeeDetail> FeeDetails { get; set; } = new List<FeeDetail>();
    }
}
