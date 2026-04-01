using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class EventFilterRequest : BaseRequest
    {
        [MaxLength(200)]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tiêu đề không được chỉ chứa khoảng trắng")]
        public string? Title { get; set; }

        [MaxLength(3000)]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Nội dung không được chỉ chứa khoảng trắng")]
        public string? Body { get; set; }
        public TimeSpan? StartTime { get; set; }
        public DateOnly? EventDate { get; set; }

        [Required(ErrorMessage = "Năm học là bắt buộc")]
        [Range(2000, 2100, ErrorMessage = "Năm học nên bắt đầu từ 2000 tới 2100")]
        public int SchoolYear { get; set; }

        [Required(ErrorMessage = "Học kì là bắt buộc")]
        [Range(1, 2, ErrorMessage = "Học kì chỉ có giá trị 1 hoặc 2")]
        public int Term { get; set; }
    }
}
