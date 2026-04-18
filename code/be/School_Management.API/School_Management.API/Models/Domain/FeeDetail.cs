using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Cryptography.X509Certificates;

namespace School_Management.API.Models.Domain
{
    public class FeeDetail
    {
        [Key]
        public Guid Id { get; set; }
        public Guid? FeeId { get; set; }
        public Guid StudentId { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal AmountDue { get; set; }
        public decimal AmountPaid { get; set; }
        public int SchoolYear { get; set; }
        public DateTimeOffset? PaidAt { get; set; }
        public string Reason { get; set; } = string.Empty;

        //Navigation properties
        [ForeignKey("FeeId")]
        public Fee Fee { get; set; } = null!;

        [ForeignKey("StudentId")]
        public Student Student { get; set; } = null!;
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
