using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class AttendanceRequest
    {
        [Required]
        public Guid ClassYearId { get; set; }

        [Required]
        public DateOnly Date { get; set; }

        public List<StudentInfoAttendance>? InfoAttendances { get; set; }
    }

    public class StudentInfoAttendance
    {
        [Required]
        public string? Status { get; set; }
        [Required]
        public Guid StudentId { get; set; }
        public string? Note { get; set; }
    }
}
