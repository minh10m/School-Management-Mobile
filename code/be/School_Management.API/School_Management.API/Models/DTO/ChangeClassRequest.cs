using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ChangeClassRequest
    {
        [Required]
        public Guid classYearId { get; set; }
    }
}
