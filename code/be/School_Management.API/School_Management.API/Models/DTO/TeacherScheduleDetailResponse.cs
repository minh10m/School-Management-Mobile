namespace School_Management.API.Models.DTO
{
    public class TeacherScheduleDetailResponse
    {
        public Guid ScheduleDetailId { get; set; }
        public string? ClassName { get; set; }
        public string? SubjectName { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan FinishTime { get; set; }
    }
}
