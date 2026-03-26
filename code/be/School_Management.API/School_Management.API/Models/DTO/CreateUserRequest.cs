using System.ComponentModel.DataAnnotations;

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
        [Phone(ErrorMessage = "Invalid phone number format")]
        [Required]
        [RegularExpression(@"^[0-9]{10,11}$", ErrorMessage = "Phone must be 10-11 digits")]
        public string? PhoneNumber { get; set; }

        //FullName
        [MaxLength(100, ErrorMessage = "FullName is too long")]
        [Required]
        [RegularExpression(@"^(?!\s*$)[\p{L}0-9 ]+$", ErrorMessage = "FullName cannot contain special characters or be only whitespace")]
        public string? FullName { get; set; }

        //Address
        [MinLength(5, ErrorMessage = "Address is too short")]
        [Required]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Address cannot be only whitespace")]
        public string? Address { get; set; }

        //Birthday
        [RegularExpression(@"^\d{4}-\d{2}-\d{2}$", ErrorMessage = "Birthday must be YYYY-MM-DD")]
        [Required]
        public string? Birthday { get; set; }

        //Role
        [Required]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Role cannot be empty")]
        public string? Role { get; set; }
    }
}
