using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class MyExamScheduleDetailRequest
    {
        [Required(ErrorMessage = "Loại lịch thi là bắt buộc")]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Loại lịch thi không được chỉ chứa khoảng trắng")]
        public string Type { get; set; } = string.Empty;

        [Required(ErrorMessage = "Học kì là bắt buộc")]
        [Range(1, 2, ErrorMessage = "Học kì nên nằm trong khoảng từ 1 tới 2")]
        public int Term { get; set; }

        [Required(ErrorMessage = "Năm học là bắt buộc")]
        [Range(2000, 2100, ErrorMessage = "Năm học nên nằm trong khoảng từ 2000 tới 2100")]
        public int SchoolYear { get; set; }
    }
}
