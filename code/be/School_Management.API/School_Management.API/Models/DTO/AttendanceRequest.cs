using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class AttendanceRequest
    {
        [Required(ErrorMessage = "Lớp học là bắt buộc")]
        public Guid ClassYearId { get; set; }

        [Required(ErrorMessage = "Ngày là bắt buộc")]
        public DateOnly Date { get; set; }

        public List<StudentInfoAttendance>? InfoAttendances { get; set; }
    }

    public class StudentInfoAttendance
    {
        [Required(ErrorMessage = "Trạng thái là bắt buộc")]
        public string? Status { get; set; }
        [Required(ErrorMessage = "Học sinh là bắt buộc ở đây")]
        public Guid StudentId { get; set; }
        public string? Note { get; set; }
    }
}
