namespace School_Management.API.Models.DTO
{
    public class ClassYearFilterRequest : BaseRequest
    {
        public string? ClassName { get; set; }
        public int? SchoolYear { get; set; }
        public int? Grade { get; set; }
    }
}
