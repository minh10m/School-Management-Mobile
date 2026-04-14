using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class FeeDetailFilterRequest : BaseRequestSecond
    {
        public Guid? FeeId { get; set; }

        [Required(ErrorMessage = "Thông tin năm học là bắt buộc")]
        [Range(2000, 2100, ErrorMessage = "Năm học nằm trong khoảng từ 2000 tới 2100")]
        public int SchoolYear { get; set; }

        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tên học sinh không được phép chứa khoảng trắng")]
        public string? StudentName { get; set; }
    }
}
