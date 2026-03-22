using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class CreateUserRequest
    {
        //Username
        [Required]
        [MinLength(4, ErrorMessage = "Username can not be only whitespace")]
        public string? Username { get; set; }

        //Password
        [Required]
        [MinLength(8, ErrorMessage = "Password mush have at least 8 characters")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$",
            ErrorMessage = "The password must include at least 1 uppercase letter, 1 lowercase letter, and 1 digit.")]
        public string? Password { get; set; }

        //Email
        [Required]
        [EmailAddress(ErrorMessage = "Invalid email format")]
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
