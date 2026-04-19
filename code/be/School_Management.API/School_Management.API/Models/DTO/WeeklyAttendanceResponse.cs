namespace School_Management.API.Models.DTO
{
    public class WeeklyAttendanceResponse
    {
        public Guid StudentId { get; set; }
        public string? StudentName { get; set; }
        public List<StudentAttendanceInfo>? Details { get; set; }
        public int TotalPresent { get; set; }
        public int TotalLate { get; set; }
        public int TotalAbsent { get; set; }
    }
}
