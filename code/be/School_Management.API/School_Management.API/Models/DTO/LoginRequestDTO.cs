using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class LoginRequestDTO
    {
        [Required(ErrorMessage = "Tên đăng nhập không được để trống")]
        public string UserName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        public string PassWord { get; set; } = string.Empty;
    }
}
