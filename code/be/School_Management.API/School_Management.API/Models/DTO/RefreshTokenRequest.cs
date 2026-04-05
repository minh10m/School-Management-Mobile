using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class RefreshTokenRequest
    {
        [Required(ErrorMessage = "RefreshToken là bắt buộc")]
        public string? RefreshToken { get; set; }
    }
}
