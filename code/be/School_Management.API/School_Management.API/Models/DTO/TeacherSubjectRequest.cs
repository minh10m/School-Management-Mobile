using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class TeacherSubjectRequest
    {
        [Required(ErrorMessage = "Giáo viên là bắt buộc")]
        public Guid? TeacherId { get; set; }

        [Required(ErrorMessage =  "Môn học là bắt buộc")]
        public Guid? SubjectId { get; set; }
    }
}
