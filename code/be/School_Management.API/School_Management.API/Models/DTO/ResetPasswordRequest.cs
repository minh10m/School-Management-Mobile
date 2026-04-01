using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ResetPasswordRequest
    {
        [Required]
        [MinLength(8, ErrorMessage = "Mật khẩu phải có 8 kí tự")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$",
            ErrorMessage = "Mật khẩu phải có ít nhất một chữ hoa, một chữ thường và một kí tự")]
        public string? NewPassword { get; set; }
    }
}
