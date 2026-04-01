using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class RefreshTokenRequest
    {
        [Required]
        public string? RefreshToken { get; set; }
    }
}
