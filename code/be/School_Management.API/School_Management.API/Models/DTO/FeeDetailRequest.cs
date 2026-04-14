using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class FeeDetailRequest
    {
        [Required(ErrorMessage = "Thông tin học sinh là bắt buộc")]
        public Guid StudentId { get; set; }

        [Required(ErrorMessage = "Số tiền cần phải đóng là bắt buộc")]
        public decimal AmountDue { get; set; }

        [Required(ErrorMessage = "Năm học là bắt buộc")]
        public int SchoolYear { get; set; }

        [Required(ErrorMessage = "Tiêu đề phí là bắt buộc")]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tiêu đề phí không được phép chứa khoảng trắng")]
        public string Reason { get; set; } = string.Empty;

    }
}
