using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ClassPromoteRequest
    {
        [Required]
        public int CurrentSystemYear { get; set; }

        [Required]
        public List<ClassPromote>? ClassPromotes { get; set; }
    }

    public class ClassPromote
    {
        public Guid FromClassYearId { get; set; }

        public Guid ToClassYearId { get; set; }
    }
}
