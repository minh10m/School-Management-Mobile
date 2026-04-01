using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ScheduleDetailIsActiveRequest 
    {
        [Required(ErrorMessage = "Học kì bắt buộc phải có")]
        [Range(1, 2)]
        public int? Term { get; set; }

        [Required(ErrorMessage = "Năm học bắt buộc phải có")]
        public int? SchoolYear { get; set; }
    }
}
