using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class PostUpdateScheduleRequest
    {
        [Required(ErrorMessage = "Mã lớp học là bắt buộc")]
        public Guid ClassYearId { get; set; }

        [Required(ErrorMessage = "Tên thời khóa biểu là bắt buộc")]
        [MaxLength(200, ErrorMessage = "Tên thời khóa biểu không được vượt quá 200 ký tự")]
        [RegularExpression(@"^(?!\s*$)[\p{L}0-9 ]+$", ErrorMessage = "Tên không được chứa kí tự đặc biệt hoặc chỉ có khoảng trắng")]
        public string? Name { get; set; }

        [Required(ErrorMessage = "Năm học là bắt buộc")]
        [Range(2000, 2100, ErrorMessage = "Năm học phải nằm trong khoảng từ 2000 đến 2100")]
        public int? SchoolYear { get; set; }

        [Required(ErrorMessage = "Trạng thái hoạt động là bắt buộc")]
        public bool? IsActive { get; set; }

        [Required(ErrorMessage = "Học kỳ là bắt buộc")]
        [Range(1, 2, ErrorMessage = "Học kỳ chỉ có giá trị là 1 hoặc 2")]
        public int? Term { get; set; }
    }
}
