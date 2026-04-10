using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class UpdateExamScheduleDetail
    {
        [Required(ErrorMessage = "Thông tin giáo viên là bắt buộc")]
        public Guid TeacherId { get; set; }

        [Required(ErrorMessage = "Thông tin môn học là bắt buộc")]
        public Guid SubjectId { get; set; }

        [Required(ErrorMessage = "Thời gian bắt đầu là bắt buộc")]
        public TimeSpan StartTime { get; set; }

        [Required(ErrorMessage = "Thời gian kết thúc là bắt buộc")]
        public TimeSpan FinishTime { get; set; }

        [Required(ErrorMessage = "Ngày là bắt buộc")]
        public DateOnly Date { get; set; }

        [Required(ErrorMessage = "Phòng thi là bắt buộc")]
        public string RoomName { get; set; } = string.Empty;
    }
}
