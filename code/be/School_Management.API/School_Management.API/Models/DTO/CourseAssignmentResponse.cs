namespace School_Management.API.Models.DTO
{
    public class CourseAssignmentResponse
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string FileTitle { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public Guid LessonId { get; set; }
        public string LessonName { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
    }
}
