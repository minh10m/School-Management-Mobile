using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class AssignmentForStudentRequest : BaseRequestSecond
    {
        [Required(ErrorMessage = "Lớp học là bắt buộc")]
        public Guid ClassYearId { get; set; }
    }
}
