using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ResetPasswordRequestDTO
    {
        [Required]
        [MinLength(8, ErrorMessage = "Password mush have at least 8 characters")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$",
            ErrorMessage = "The password must include at least 1 uppercase letter, 1 lowercase letter, and 1 digit.")]
        public string NewPassword { get; set; }
    }
}
