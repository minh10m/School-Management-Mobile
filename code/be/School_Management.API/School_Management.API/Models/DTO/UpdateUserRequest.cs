using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class UpdateUserRequest
    {
        //Không cập nhật thì để null, đã cập nhật thì phải nhập không để trắng ""
        //Và quan trọng phải nhập đúng định dạng.
        [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
        public string? Email { get; set; }

        [Phone(ErrorMessage = "Số điện thoại không đúng định dạng")]
        [RegularExpression(@"^[0-9]{10,11}$", ErrorMessage = "Số điện thoại phải từ 10 - 11 số")]
        public string? PhoneNumber { get; set; }

        [MaxLength(100, ErrorMessage = "Tên quá dài")]
        [RegularExpression(@"^(?!\s*$)[\p{L}0-9 ]+$", ErrorMessage = "Tên không được chứa kí tự đặc biệt hoặc là khoảng trắng")]
        public string? FullName { get; set; }

        [MinLength(5, ErrorMessage = "Địa chỉ quá dài")]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Địa chỉ không được phép là khoảng trắng")]
        public string? Address { get; set; }

        [RegularExpression(@"^\d{4}-\d{2}-\d{2}$", ErrorMessage = "Ngày sinh nhật cần có định dạng YYYY-MM-DD")]
        public string? Birthday { get; set; }
    }
}
