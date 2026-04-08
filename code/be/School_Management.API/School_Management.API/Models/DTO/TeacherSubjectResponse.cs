namespace School_Management.API.Models.DTO
{
    public class TeacherSubjectResponse
    {
        public Guid TeacherSubjectId { get; set; }
        public Guid TeacherId { get; set; }
        public string? TeacherName { get; set; }
        public Guid SubjectId { get; set; }
        public string? SubjectName { get; set; }
    }
}
