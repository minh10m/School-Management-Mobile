namespace School_Management.API.Models.DTO
{
    public class SubjectFilterRequest : BaseRequest
    {
        public string? SubjectName { get; set; }
        public int? MaxPeriod { get; set; }
    }
}
