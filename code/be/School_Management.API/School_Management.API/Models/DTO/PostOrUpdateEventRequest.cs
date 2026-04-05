using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class PostOrUpdateEventRequest
    {
        [Required(ErrorMessage = "Tiêu đề sự kiện là bắt buộc")]
        [MinLength(10, ErrorMessage = "Tiêu đề sự kiện cần có tối thiểu 10 kí tự")]
        [MaxLength(200, ErrorMessage = "Tiêu đề sự kiện có tối đa 200 kí tự")]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tiêu đề không được chỉ chứa khoảng trắng")]
        public string? Title { get; set; }

        [Required(ErrorMessage = "Nội dung sự kiện là bắt buộc")]
        [MinLength(10, ErrorMessage = "Nội dung sự kiện cần có tối thiểu 10 kí tự")]
        [MaxLength(3000, ErrorMessage = "Nội dung sự kiện có tối đa 3000 kí tự")]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Nội dung không được chỉ chứa khoảng trắng")]
        public string? Body { get; set; }

        [Required(ErrorMessage = "Thời gian bắt đầu là bắt buộc")]
        public TimeSpan StartTime { get; set; }

        [Required(ErrorMessage = "Thời gian kết thúc là bắt buộc")]
        public TimeSpan FinishTime { get; set; }
        [Required(ErrorMessage = "Ngày là bắt buộc")]
        public DateOnly EventDate { get; set; }

        [Required(ErrorMessage = "Năm học là bắt buộc")]
        [Range(2000, 2100, ErrorMessage = "Năm học nên bắt đầu từ 2000 tới 2100")]
        public int SchoolYear { get; set; }

        [Required(ErrorMessage = "Học kì là bắt buộc")]
        [Range(1, 2, ErrorMessage = "Học kì chỉ có giá trị 1 hoặc 2")]
        public int Term { get; set; }
    }
}
