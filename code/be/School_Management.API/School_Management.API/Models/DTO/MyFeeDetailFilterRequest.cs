using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class MyFeeDetailFilterRequest : BaseRequestSecond
    {
        [Required(ErrorMessage = "Năm học là bắt buộc")]
        public int SchoolYear { get; set; }

        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tiêu đề phí không được phép chứa khoảng trắng")]
        public string? Reason { get; set; }
    }
}
