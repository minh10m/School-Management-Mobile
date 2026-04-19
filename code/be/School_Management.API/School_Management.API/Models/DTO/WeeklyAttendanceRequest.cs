using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class WeeklyAttendanceRequest
    {
        [Required(ErrorMessage = "Lớp học là bắt buộc")]
        public Guid ClassYearId { get; set; }

        [Required(ErrorMessage = "Ngày bắt đầu là bắt buộc")]
        public DateOnly StartDate { get; set; }
    }
}
