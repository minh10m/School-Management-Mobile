using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class PostOrUpdateSubjectRequest
    {
        [Required(ErrorMessage = "Tên môn học là bắt buộc")]
        [MaxLength(100, ErrorMessage = "Tên môn học quá dài")]
        [RegularExpression(@"^(?!\s*$)[\p{L}0-9 ]+$", ErrorMessage = "Tên môn học không được chứa kí tự đặc biệt hoặc là khoảng trắng")]
        public string? SubjectName { get; set; }

        [Required(ErrorMessage = "Số tiết tối đa là bắt buộc")]
        [Range(1, 5, ErrorMessage = "Số tiết tối đa chỉ trong khoảng từ 1 tới 5")]
        public int MaxPeriod { get; set; }
    }
}
