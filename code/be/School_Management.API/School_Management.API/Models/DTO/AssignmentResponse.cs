namespace School_Management.API.Models.DTO
{
    public class AssignmentResponse
    {
        public Guid AssignmentId { get; set; }
        public string? Title { get; set; } 
        public string? FileUrl { get; set; }
        public string? FileTitle { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTimeOffset StartTime { get; set; }
        public DateTimeOffset FinishTime { get; set; }
        public Guid TeacherSubjectId { get; set; }
        public string TeacherName { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public Guid ClassYearId { get; set; }
        public string ClassName { get; set; } = string.Empty;
    }

    public class AssignmentResponseForStudent : AssignmentResponse
    {
        public string? Status { get; set; }
    }
}
