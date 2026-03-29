namespace School_Management.API.Models.DTO
{
    public class SubjectResponse
    {
        public Guid SubjectId { get; set; }
        public string? SubjectName { get; set; }
        public int MaxPeriod { get; set; }
    }
}
