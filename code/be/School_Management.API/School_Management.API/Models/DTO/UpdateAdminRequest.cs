using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class UpdateAdminRequest
    {
        //Không cập nhật thì để null, đã cập nhật thì phải nhập không để trắng ""
        //Và quan trọng phải nhập đúng định dạng.
        [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
        public string? Email { get; set; }

        [Phone(ErrorMessage = "Số điện thoại không đúng định dạng")]
        [RegularExpression(@"^[0-9]{10,11}$", ErrorMessage = "Số điện thoại phải từ 10 - 11 số")]
        public string? PhoneNumber { get; set; }

        [MaxLength(100, ErrorMessage = "FullName is too long")]
        [RegularExpression(@"^(?!\s*$)[\p{L}0-9 ]+$", ErrorMessage = "FullName cannot contain special characters or be only whitespace")]
        public string? FullName { get; set; }

        [MinLength(5, ErrorMessage = "Address is too short")]
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Address cannot be only whitespace")]
        public string? Address { get; set; }

        [RegularExpression(@"^\d{4}-\d{2}-\d{2}$", ErrorMessage = "Birthday must be YYYY-MM-DD")]
        public string? Birthday { get; set; }

    }
}
