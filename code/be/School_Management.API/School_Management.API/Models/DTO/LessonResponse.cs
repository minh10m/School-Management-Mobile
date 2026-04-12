namespace School_Management.API.Models.DTO
{
    public class LessonResponse
    {
        public Guid Id { get; set; }
        public string LessonName { get; set; } = string.Empty;
        public Guid CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public int OrderIndex { get; set; }

    }
}
