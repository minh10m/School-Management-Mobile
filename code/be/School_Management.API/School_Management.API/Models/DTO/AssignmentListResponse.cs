namespace School_Management.API.Models.DTO
{
    public class AssignmentListResponse
    {
        public Guid AssignmentId { get; set; }
        public string? Title { get; set; }
        public string? FileUrl { get; set; }
        public string? FileTitle { get; set; }
        public DateTimeOffset StartTime { get; set; }
        public DateTimeOffset FinishTime { get; set; }
    }
}
