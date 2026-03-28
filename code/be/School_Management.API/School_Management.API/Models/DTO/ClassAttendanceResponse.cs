namespace School_Management.API.Models.DTO
{
    public class ClassAttendanceResponse
    {
        public Guid StudentId { get; set; }
        public string? StudentName { get; set; }

        public AttendanceInfo? AttendanceInfo { get; set; }
    }

    public class AttendanceInfo
    {
        public string? Status { get; set; }
        public Guid? AttendanceId { get; set; }
        public string? Note { get; set; }
    }
}
