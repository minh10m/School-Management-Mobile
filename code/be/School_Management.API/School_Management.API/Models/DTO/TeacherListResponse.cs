namespace School_Management.API.Models.DTO
{
    public class TeacherListResponse
    {
        public Guid TeacherId { get; set; }
        public Guid UserId { get; set; }
        public string? FullName { get; set; }
        public List<string>? SubjectNames { get; set; }
    }
}
