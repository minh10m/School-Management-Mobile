using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class AssignmentFilterRequest : BaseRequest
    {
        [Required(ErrorMessage = "Lớp học là bắt buộc")]
        public Guid ClassYearId { get; set; }

        public string? Title { get; set; }

        [Required(ErrorMessage = "Môn học là bắt buộc")]
        public Guid SubjectId { get; set; }

    }
}
