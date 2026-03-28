using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ClassAttendanceRequest
    {
        [Required(ErrorMessage = "Mã lớp là bắt buộc")]
        public Guid ClassYearId { get; set; }

        [Required(ErrorMessage = "Ngày là bắt buộc")]
        public DateOnly Date { get; set; }
    }
}
