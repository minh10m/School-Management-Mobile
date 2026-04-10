namespace School_Management.API.Models.DTO
{
    public class ExamScheduleDetailResponse
    {
        public Guid ExamScheduleDetailId { get; set; }
        public Guid ExamScheduleId { get; set; }
        public Guid? TeacherId { get; set; }
        public Guid SubjectId { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan FinishTime { get; set; }
        public DateOnly Date { get; set; }
        public string RoomName { get; set; } = string.Empty;
    }
}
