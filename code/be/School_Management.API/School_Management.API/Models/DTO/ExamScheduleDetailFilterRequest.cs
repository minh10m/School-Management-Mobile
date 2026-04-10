using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ExamScheduleDetailFilterRequest : BaseRequestSecond
    {

        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tên môn học không được chỉ chứa khoảng trắng")]
        public string? SubjectName { get; set; } = string.Empty;


        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tên giáo viên không được chỉ chứa khoảng trắng")]
        public string? TeacherName { get; set; }

    }
}
