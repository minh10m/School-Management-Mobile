namespace School_Management.API.Models.DTO
{
    public class FeeResponse
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTimeOffset DueDate { get; set; }
        public Guid ClassYearId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public int SchoolYear { get; set; }
    }
}
