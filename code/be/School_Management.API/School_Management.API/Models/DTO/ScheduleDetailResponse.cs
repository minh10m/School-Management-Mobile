namespace School_Management.API.Models.DTO
{
    public class ScheduleDetailResponse
    {
        public Guid ScheduleDetailId { get; set; }
        public Guid ScheduleId { get; set; }
        public Guid TeacherSubjectId { get; set; }
        public string? TeacherName { get; set; }
        public string? SubjectName { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan FinishTime { get; set; }
        public List<string>? Errors { get; set; }
    }
}
