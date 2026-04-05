using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ClassPromoteRequest
    {
        [Required(ErrorMessage = "Năm học hiện tại là bắt buộc")]
        public int CurrentSystemYear { get; set; }

        [Required(ErrorMessage = "Thông tin lớp chuyển tới và chuyển đi là bắt buộc")]
        public List<ClassPromote>? ClassPromotes { get; set; }
    }

    public class ClassPromote
    {
        public Guid FromClassYearId { get; set; }

        public Guid ToClassYearId { get; set; }
    }
}
