using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class CourseFilterRequestTeacherAndStudent : BaseRequestSecond
    {
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tên khóa học không được chỉ chứa khoảng trắng")]
        public string CourseName { get; set; } = string.Empty;
    }
}
