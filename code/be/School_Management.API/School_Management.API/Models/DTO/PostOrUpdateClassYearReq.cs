using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class PostOrUpdateClassYearReq
    {
        [Required(ErrorMessage = "Tên lớp là bắt buộc")]
        [MaxLength(10, ErrorMessage = "Tên quá dài")]
        [RegularExpression(@"^[a-zA-Z0-9]+$", ErrorMessage = "Tên lớp chỉ được chứa chữ và số, không có khoảng trắng hoặc ký tự đặc biệt")]
        public string? ClassName { get; set; }

        [Required(ErrorMessage = "Khối là bắt buộc")]
        [Range(10, 12, ErrorMessage = "Khối chỉ nằm trong khoảng từ 10 tới 12")]
        public int Grade { get; set; }

        [Required(ErrorMessage = "Năm học là bắt buộc")]
        [Range(2000, 2100, ErrorMessage = "Năm học nằm khoảng từ 2000 tới 2100")]
        public int SchoolYear { get; set; }

        [Required(ErrorMessage = "Giáo viên chủ nhiệm là bắt buộc")]
        public Guid HomeRoomId { get; set; }
    }
}
