using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ExamScheduleRequest
    {
        [Required(ErrorMessage = "Loại lịch thi là bắt buộc")]
        [MaxLength(500, ErrorMessage = "Độ dài kí tự của loại lịch tối đa là 500")]
        [MinLength(2, ErrorMessage = "Độ dài kí tự tối thiểu của loại lịch là 2")]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Loại lịch thi không được chỉ chứa khoảng trắng")]
        public string Type { get; set; } = string.Empty;

        [Required(ErrorMessage = "Học kì là bắt buộc")]
        [Range(1, 2, ErrorMessage = "Học kì nằm trong khoảng từ 1 tới 2")]
        public int Term { get; set; }

        [Required(ErrorMessage = "Năm học số là bắt buộc")]
        [Range(2000, 2100, ErrorMessage = "Năm học chỉ nằm trong khoảng từ 2000 tới 2100")]
        public int SchoolYear { get; set; }

        [Required(ErrorMessage = "Khối lớp là bắt buộc")]
        [Range(10, 12, ErrorMessage = "Khối lớp nằm trong khoảng từ 10 tới 12")]
        public int Grade { get; set; }

        [Required(ErrorMessage = "Trạng thái hoạt động là bắt buộc")]
        public bool IsActive { get; set; }
    }
}
