namespace School_Management.API.Models.DTO
{
    public class CourseResponse
    {
        public Guid Id { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public Guid TeacherSubjectId { get; set; }
        public string TeacherName { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? PublishedAt { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}
