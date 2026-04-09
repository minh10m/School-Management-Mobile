using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ClassOfTeacherFilterRequest : BaseRequest
    {
        public string? ClassName { get; set; }

        [Required(ErrorMessage = "Năm học là bắt buộc")]
        public int? SchoolYear { get; set; }

        [Range(10, 12, ErrorMessage = "Khối nằm trong khoảng từ 10 tới 12")]

        public int? Grade { get; set; }
    }
}
