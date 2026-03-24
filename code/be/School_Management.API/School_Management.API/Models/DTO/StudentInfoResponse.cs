namespace School_Management.API.Models.DTO
{
    public class StudentInfoResponse
    {
        public Guid StudentId { get; set; }
        public Guid UserId { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public DateTimeOffset? Birthday { get; set; }
        public List<ClassYearSub>? ClassYearSub { get; set; }
    }

    public class ClassYearSub
    {
        public int Grade { get; set; }
        public int SchoolYear { get; set; }
        public string? ClassName { get; set; }

    }
}
