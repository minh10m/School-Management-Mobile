namespace School_Management.API.Models.DTO
{
    public class LessonVideoResponse
    {
        public Guid Id { get; set; }
        public string Url { get; set; } = string.Empty;
        public bool IsPreview { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid LessonId { get; set; }
        public string LessonName { get; set; } = string.Empty;
        public int Duration { get; set; }
        public int OrderIndex { get; set; }
    }
}
