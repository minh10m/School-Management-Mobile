namespace School_Management.API.Models.DTO
{
    public class MyExamScheduleDetailResponse
    {
        public Guid ExamScheduleDetailId { get; set; }
        public Guid ExamScheduleId { get; set; }
        public Guid TeacherId { get; set; }
        public string TeacherName { get; set; } = string.Empty;
        public Guid SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public TimeSpan StartTime { get; set; }
        public TimeSpan FinishTime { get; set; }
        public DateOnly Date { get; set; }
        public string RoomName { get; set; } = string.Empty;
        public string IdentificationNumber { get; set; } = string.Empty;
    }
}
