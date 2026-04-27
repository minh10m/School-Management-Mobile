using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class AIChatRequest
    {
        [Required(ErrorMessage = "Câu hỏi đầu vào là bắt buộc")]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Câu hỏi không được chỉ chứa khoảng trắng")]
        public string UserQuestion { get; set; } = string.Empty;
    }
}
