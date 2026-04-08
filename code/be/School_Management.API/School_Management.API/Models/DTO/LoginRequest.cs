using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class LoginRequest
    {
        [Required(ErrorMessage = "Tên đăng nhập không được để trống")]
        public string? UserName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        [MinLength(8, ErrorMessage = "Mật khẩu phải có 8 kí tự")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$",
            ErrorMessage = "Mật khẩu phải có ít nhất một chữ hoa, một chữ thường và một kí tự")]
        public string? PassWord { get; set; } = string.Empty;
    }
}
