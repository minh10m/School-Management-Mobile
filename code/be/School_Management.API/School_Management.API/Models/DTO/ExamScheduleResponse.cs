namespace School_Management.API.Models.DTO
{
    public class ExamScheduleResponse
    {
        public Guid ExamScheduleId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public int Term { get; set; }
        public int SchoolYear { get; set; }
        public int Grade { get; set; }
        public bool IsActive { get; set; }
    }
}
