namespace School_Management.API.Models.DTO
{
    public class TeacherInfoResponse
    {
        public Guid TeacherId { get; set; }
        public Guid UserId { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTimeOffset? Birthday { get; set; }
        public string? Address { get; set; }
        public List<string>? SubjectNames { get; set; }
    }
}
