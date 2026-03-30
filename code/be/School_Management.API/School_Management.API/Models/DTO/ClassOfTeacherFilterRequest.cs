using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ClassOfTeacherFilterRequest : BaseRequest
    {
        public string? ClassName { get; set; }

        [Required(ErrorMessage = "Năm học là bắt buộc")]
        public int? SchoolYear { get; set; }

        public int? Grade { get; set; }
    }
}
