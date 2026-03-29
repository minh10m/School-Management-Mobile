namespace School_Management.API.Models.DTO
{
    public class TeacherOfSubjectResponse
    {
        public Guid TeacherId { get; set; }
        public Guid UserId { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
    }
}
