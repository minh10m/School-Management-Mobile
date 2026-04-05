using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ScoreSubmissionRequest
    {
        [Required(ErrorMessage = "Điểm là bắt buộc")]
        [Range(0, 10, ErrorMessage = "Điểm chỉ nên nằm trong khoảng từ 0 tới 10")]
        public float Score { get; set; }

    }
}
