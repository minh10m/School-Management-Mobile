using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class PostUpdateScheduleRequest
    {
        [Required]
        public Guid ClassYearId { get; set; }

        [Required]
        [MaxLength(200, ErrorMessage = "Name is too long")]
        [RegularExpression(@"^(?!\s*$)[\p{L}0-9 ]+$", ErrorMessage = "Name cannot contain special characters or be only whitespace")]
        public string? Name { get; set; }

        [Required]
        public int SchoolYear { get; set; }

        [Required]
        public bool IsActive { get; set; }

        [Required]
        [Range(1, 2, ErrorMessage = "The value of term is 1 or 2")]
        public int Term { get; set; }
    }
}
