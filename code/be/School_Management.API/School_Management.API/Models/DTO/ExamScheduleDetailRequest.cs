using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ExamScheduleDetailRequest
    {
        [EmailAddress(ErrorMessage = "Không đúng định dạng email")]
        [Required(ErrorMessage = "Địa chỉ email giáo viên là bắt buộc không được bỏ trống")]
        public string TeacherEmail { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tên môn học là bắt buộc")]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tên môn học không được chỉ chứa khoảng trắng")]
        public string SubjectName { get; set; } = string.Empty;

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
