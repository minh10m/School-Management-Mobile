using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.Domain
{
    public class SchoolYearInfo
    {
        [Key]
        public Guid Id { get; set; }
        public int Term { get; set; }
        public int SchoolYear { get; set; }
    }
}
