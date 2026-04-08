using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class SubmissionStudentRequest
    {
        [Required(ErrorMessage = "Mã bài tập là bắt buộc")]
        public Guid AssignmentId { get; set; }
    }
}
