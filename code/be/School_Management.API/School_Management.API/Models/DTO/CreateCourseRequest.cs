namespace School_Management.API.Models.DTO
{
    public class CreateCourseRequest
    {
        public string CourseName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public Guid SubjectId { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}
