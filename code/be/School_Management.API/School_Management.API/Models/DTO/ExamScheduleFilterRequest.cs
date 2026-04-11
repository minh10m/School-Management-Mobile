using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ExamScheduleFilterRequest : BaseRequestSecond
    {
        public int? Term { get; set; }

        public int? SchoolYear { get; set; }

        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tên lịch thi không được chỉ chứa khoảng trắng")]
        public string? Title { get; set; }

        public string? Type { get; set; }

        public int? Grade { get; set; }

        public bool? IsActive { get; set; }
    }
}
