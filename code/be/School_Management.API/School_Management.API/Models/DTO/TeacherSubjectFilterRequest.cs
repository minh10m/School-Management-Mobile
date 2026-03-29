namespace School_Management.API.Models.DTO
{
    public class TeacherSubjectFilterRequest : BaseRequest
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
    }
}
