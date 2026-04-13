using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class FeeRequest
    {
        [Required(ErrorMessage = "Tiêu đề của phí là bắt buộc")]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tiêu đề phí không được phép chứa khoảng trắng")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Số tiền phải đóng của phí là bắt buộc")]
        public decimal Amount { get; set; }

        [Required(ErrorMessage = "Ngày tới hạn là bắt buộc")]
        public DateTimeOffset DueDate { get; set; }

        [Required(ErrorMessage = "Thông tin lớp là bắt buộc")]
        public Guid ClassYearId { get; set; }

        [Required(ErrorMessage = "Năm học là bắt buộc")]
        [Range(2000, 2100, ErrorMessage = "Năm học nằm trong khoảng từ 2000 tới 2100")]
        public int SchoolYear { get; set; }
    }
}
