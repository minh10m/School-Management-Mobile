namespace School_Management.API.Models.DTO
{
    public class StudentAttendanceResponse
    {
        public int TotalPresent { get; set; }
        public int TotalAbsent { get; set; }
        public double Percentage { get; set; }
        public List<StudentAttendanceInfo>? StudentAttendances { get; set; }
    }

    public class StudentAttendanceInfo
    {
        public DateOnly Date { get; set; }
        public string? Status { get; set; }
        public string? Note { get; set; }
    }
}
