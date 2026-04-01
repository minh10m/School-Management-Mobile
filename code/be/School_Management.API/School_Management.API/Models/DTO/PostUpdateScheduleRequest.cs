using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class PostUpdateScheduleRequest
    {
        [Required]
        public Guid ClassYearId { get; set; }

        [Required]
        [MaxLength(200, ErrorMessage = "Tên quá dài")]
        [RegularExpression(@"^(?!\s*$)[\p{L}0-9 ]+$", ErrorMessage = "Tên không được chứa kí tự đặc biệt hoặc là khoảng trắng")]
        public string? Name { get; set; }

        [Required]
        public int? SchoolYear { get; set; }

        [Required]
        public bool? IsActive { get; set; }

        [Required]
        [Range(1, 2, ErrorMessage = "Kì chỉ có giá trị là 1 hoặc 2")]
        public int? Term { get; set; }
    }
}
