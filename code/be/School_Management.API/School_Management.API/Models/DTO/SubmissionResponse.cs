namespace School_Management.API.Models.DTO
{
    public class SubmissionResponse
    {
        public Guid SubmissionId { get; set; }
        public DateTimeOffset TimeSubmit { get; set; }
        public string? Status { get; set; }
        public Guid AssignmentId { get; set; }
        public string FileTitle { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public Guid StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public float? Score { get; set; }
    }
}
