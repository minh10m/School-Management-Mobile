using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class SubmissionUpdateRequest
    {
        [Required(ErrorMessage = "File nộp bài là bắt buộc, dung lượng dưới 20MB")]
        public IFormFile File { get; set; } = null!;

        public string? FileTitle { get; set; }

    }
}
