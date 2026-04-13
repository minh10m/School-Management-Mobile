using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class FeeFilterRequest : BaseRequestSecond
    {
        [Required(ErrorMessage = "Năm học là bắt buộc")]
        [Range(2000, 2100, ErrorMessage = "Năm học nằm trong khoảng từ 2000 tới 2100")]
        public int SchoolYear { get; set; }
    }
}
