using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices;

namespace School_Management.API.Models.DTO
{
    public class CreateUserRequest
    {
        //Username
        [Required]
        [MinLength(4, ErrorMessage = "Tên đăng nhập không được phép là khoảng trắng")]
        public string? Username { get; set; }

        //Password
        [Required]
        [MinLength(8, ErrorMessage = "Mật khẩu phải có 8 kí tự")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$",
            ErrorMessage = "Mật khẩu phải có ít nhất một chữ hoa, một chữ thường và một kí tự")]
        public string? Password { get; set; }

        //Email
        [Required]
        [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
        public string? Email { get; set; }

        //PhoneNumber
        [Phone(ErrorMessage = "Số điện thoại không đúng định dạng")]
        [Required]
        [RegularExpression(@"^[0-9]{10,11}$", ErrorMessage = "Số điện thoại phải từ 10 - 11 số")]
        public string? PhoneNumber { get; set; }

        //FullName
        [MaxLength(100, ErrorMessage = "Tên quá dài")]
        [Required]
        [RegularExpression(@"^(?!\s*$)[\p{L}0-9 ]+$", ErrorMessage = "Tên không được chứa kí tự đặc biệt hoặc là khoảng trắng")]
        public string? FullName { get; set; }

        //Address
        [MinLength(5, ErrorMessage = "Địa chỉ quá dài")]
        [Required]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Địa chỉ không được phép là khoảng trắng")]
        public string? Address { get; set; }

        //Birthday
        [RegularExpression(@"^\d{4}-\d{2}-\d{2}$", ErrorMessage = "Ngày sinh nhật cần có định dạng YYYY-MM-DD")]
        [Required]
        public string? Birthday { get; set; }

        //Role
        [Required]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Vai trò không được để trống")]
        public string? Role { get; set; }

        public Guid? ClassYearId { get; set; }
        public List<Guid>? SubjectId { get; set; }
    }
}
