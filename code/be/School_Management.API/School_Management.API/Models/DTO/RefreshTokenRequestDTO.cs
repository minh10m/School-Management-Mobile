using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class RefreshTokenRequestDTO
    {
        [Required]
        public string RefreshToken { get; set; }
    }
}
