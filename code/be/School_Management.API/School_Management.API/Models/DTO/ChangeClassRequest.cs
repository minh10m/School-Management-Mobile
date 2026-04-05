using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ChangeClassRequest
    {
        [Required(ErrorMessage = "Lớp học là bắt buộc")]
        public Guid classYearId { get; set; }
    }
}
