using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class UpdateTeacherSubjectRequest
    {
        [Required(ErrorMessage = "Mã giáo viên là bắt buộc")]
        public Guid TeacherId { get; set; }

        [Required(ErrorMessage = "Mã môn học cũ là bắt buộc")]
        public Guid OldSubjectId { get; set; }

        [Required(ErrorMessage = "Mã môn học mới là bắt buộc")]
        public Guid NewSubjectId { get; set; }
    }
}
