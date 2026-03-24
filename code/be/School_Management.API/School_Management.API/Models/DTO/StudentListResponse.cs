namespace School_Management.API.Models.DTO
{
    public class StudentListResponse
    {
        public Guid StudentId { get; set; }
        public Guid UserId { get; set; }
        public string? FullName { get; set; }
        public string? ClassName { get; set; }
        public int Grade { get; set; }
    }
}
