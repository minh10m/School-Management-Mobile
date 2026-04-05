using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class EventFilterRequest : BaseRequest
    {
        [MaxLength(200, ErrorMessage = "Tiêu đề không được vượt quá 200 ký tự")]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tiêu đề không được để trống hoặc chỉ chứa khoảng trắng")]
        [MinLength(10, ErrorMessage = "Tiêu đề phải có ít nhất 10 ký tự")]
        public string? Title { get; set; }

        [MaxLength(3000, ErrorMessage = "Nội dung không được vượt quá 3000 ký tự")]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Nội dung không được để trống hoặc chỉ chứa khoảng trắng")]
        [MinLength(10, ErrorMessage = "Nội dung phải có ít nhất 10 ký tự")]
        public string? Body { get; set; }

        public TimeSpan? StartTime { get; set; }

        public DateOnly? EventDate { get; set; }

        [Required(ErrorMessage = "Năm học là bắt buộc")]
        [Range(2000, 2100, ErrorMessage = "Năm học phải nằm trong khoảng từ 2000 đến 2100")]
        public int SchoolYear { get; set; }

        [Required(ErrorMessage = "Học kỳ là bắt buộc")]
        [Range(1, 2, ErrorMessage = "Học kỳ chỉ có giá trị là 1 hoặc 2")]
        public int Term { get; set; }
    }
}
