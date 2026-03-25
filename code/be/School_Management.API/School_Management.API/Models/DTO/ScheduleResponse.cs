namespace School_Management.API.Models.DTO
{
    public class ScheduleResponse
    {
        public Guid ScheduleId { get; set; }
        public int Term { get; set; }
        public string? Name { get; set; }
        public Guid ClassYearId { get; set; }
        public string? ClassName { get; set; }
        public int SchoolYear { get; set; }
    }
}
