using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ResultOfStudentRequest : ResultOfAllStudentRequest
    {
        [Required(ErrorMessage = "Năm học số là bắt buộc")]
        [Range(2000, 2100, ErrorMessage = "Năm học chỉ nằm trong khoảng từ 2000 tới 2100")]
        public int SchoolYear { get; set; }
    }

    public class ResultOfAllStudentRequest
    {
        [Required(ErrorMessage = "Học kì là bắt buộc")]
        [Range(1, 2, ErrorMessage = "Học kì nằm trong khoảng từ 1 tới 2")]
        public int Term { get; set; }
    }
}
