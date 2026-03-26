namespace School_Management.API.Models.DTO
{
    public class TeacherFilterRequest :BaseRequest
    {
        public string? FullName { get; set; }
        public string? SubjectName { get; set; }
    }
}
