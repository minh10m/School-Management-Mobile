namespace School_Management.API.Models.DTO
{
    public class StudentFilterRequest : BaseRequest
    {
        public string? FullName { get; set; }
        public string? ClassName { get; set; }
        public int Grade { get; set; } = 0;
    }
}
