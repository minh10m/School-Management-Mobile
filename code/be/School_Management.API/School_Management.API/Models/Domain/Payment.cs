using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class Payment
    {
        [Key]
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public decimal Amount { get; set; }
        public decimal ActualAmount { get; set; }
        public string OrderCode { get; set; } = string.Empty;
        public Guid? FeeDetailId { get; set; }
        public Guid? CourseId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? TransactionId { get; set; } 
        public DateTimeOffset? PaidAt { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }

        //Navigation properties
        [ForeignKey("UserId")]
        public AppUser User { get; set; } = null!;

        [ForeignKey("CourseId")]
        public Course? Course { get; set; }

        [ForeignKey("FeeDetailId")]
        public FeeDetail? FeeDetail { get; set; }

    }
}
