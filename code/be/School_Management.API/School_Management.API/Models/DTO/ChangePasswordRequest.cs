using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ChangePasswordRequest
    {
        [Required]
        public string? OldPassword { get; set; }

        [Required]
        [MinLength(8, ErrorMessage = "Mật khẩu phải có 8 kí tự")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$", 
            ErrorMessage = "Mật khẩu phải có ít nhất một chữ hoa, một chữ thường và một kí tự")]
        public string? NewPassword { get; set; }

        [Required]
        [Compare("NewPassword", ErrorMessage = "ConfirmPassword không chính xác")]
        public string? ConfirmPassword { get; set; }
    }
}
