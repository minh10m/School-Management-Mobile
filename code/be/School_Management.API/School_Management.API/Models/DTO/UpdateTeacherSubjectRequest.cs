using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class UpdateTeacherSubjectRequest
    {
        [Required]
        public Guid TeacherId { get; set; }

        [Required]
        public Guid OldSubjectId { get; set; }

        [Required]
        public Guid NewSubjectId { get; set; }
    }
}
