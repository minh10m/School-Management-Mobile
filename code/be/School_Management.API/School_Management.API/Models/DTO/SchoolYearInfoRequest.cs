using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class SchoolYearInfoRequest
    {
        [Required(ErrorMessage = "Học kì bắt buộc phải có")]
        [Range(1, 2, ErrorMessage = "Học kì chỉ nằm trong khoảng từ 1 tới 2")]
        public int Term { get; set; }

        [Required(ErrorMessage = "Năm học bắt buộc phải có")]
        [Range(2000, 2100, ErrorMessage = "Năm học nằm trong khoảng từ 2000 tới 2100")]
        public int SchoolYear { get; set; }
    }
}
