using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ClassPromoteRequest
    {
        [Required]
        public Guid FromClassYearId { get; set; }

        [Required]
        public Guid ToClassYearId { get; set; }
    }
}
