using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ClassOfStudentRequest
    {
        [Required(ErrorMessage = "Năm học là bắt buộc")]
        public int? SchoolYear { get; set; }
    }
}
