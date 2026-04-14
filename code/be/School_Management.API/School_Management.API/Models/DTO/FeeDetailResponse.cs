namespace School_Management.API.Models.DTO
{
    public class FeeDetailResponse
    {
        public Guid Id { get; set; }
        public Guid? FeeId { get; set; }
        public Guid StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal AmountDue { get; set; }
        public int SchoolYear { get; set; }
        public decimal AmountPaid { get; set; }
        public DateTimeOffset? PaidAt { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}
