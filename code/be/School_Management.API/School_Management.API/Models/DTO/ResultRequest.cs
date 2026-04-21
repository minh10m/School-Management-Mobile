using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ResultRequest
    {
        [Required(ErrorMessage = "Loại điểm số là bắt buộc")]
        [RegularExpression("^(Miệng|15 phút|Giữa kì|Cuối kì)$", ErrorMessage = "Loại điểm số không hợp lệ, chỉ được nhận giá trị là [Miệng], [15 phút], [Giữa kì] hoặc [Cuối kì]")]
        public string Type { get; set; } = string.Empty;

        [Required(ErrorMessage = "Điểm số là bắt buộc")]
        [Range(0, 10, ErrorMessage = "Điểm số nằm trong khoảng từ 0 tới 10")]
        public float Value { get; set; }

        [Required(ErrorMessage = "Mã học sinh là bắt buộc")]
        public Guid StudentId { get; set; }

        [Required(ErrorMessage = "Mã môn học là bắt buộc")]
        public Guid SubjectId { get; set; }

        [Required(ErrorMessage = "Học kì là bắt buộc")]
        [Range(1, 2, ErrorMessage = "Học kì nằm trong khoảng từ 1 tới 2")]
        public int Term { get; set; }

        [Required(ErrorMessage = "Năm học số là bắt buộc")]
        [Range(2000, 2100, ErrorMessage = "Năm học chỉ nằm trong khoảng từ 2000 tới 2100")]
        public int SchoolYear { get; set; }
    }
}
