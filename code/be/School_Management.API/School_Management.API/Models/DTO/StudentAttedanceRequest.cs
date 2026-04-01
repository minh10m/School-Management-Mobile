using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class StudentAttedanceRequest
    {
        [Required(ErrorMessage = "Tháng là bắt buộc")]
        public int? Month { get; set; }

        [Required(ErrorMessage = "Năm là bắt buộc")]
        public int? Year { get; set; }
    }
}
