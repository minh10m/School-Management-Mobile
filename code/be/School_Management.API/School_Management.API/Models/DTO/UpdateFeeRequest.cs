using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class UpdateFeeRequest
    {
        [Required(ErrorMessage = "Tiêu đề của phí là bắt buộc")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Ngày tới hạn là bắt buộc")]
        public DateTimeOffset DueDate { get; set; }
    }
}
