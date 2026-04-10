namespace School_Management.API.Models.DTO
{
    public class ExamStudentAssignmentResponse
    {
        public string StudentName { get; set; } = string.Empty;
        public Guid StudentId { get; set; }
        public string IdentificationNumber { get; set; } = string.Empty;
        public Guid ExamStudentAssignmentId { get; set; }
    }
}
