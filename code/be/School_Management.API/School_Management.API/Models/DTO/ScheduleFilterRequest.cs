using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ScheduleFilterRequest : BaseRequest
    {
        [Required(ErrorMessage = "Học kì bắt buộc phải có")]
        [Range(1, 2)]
        public int Term { get; set; }

        [Required(ErrorMessage = "Năm học bắt buộc phải có")]
        public int SchoolYear { get; set; }

        [Required(ErrorMessage = "Trạng thái lịch học phải có")]
        public bool IsActive { get; set; }
    }
}
