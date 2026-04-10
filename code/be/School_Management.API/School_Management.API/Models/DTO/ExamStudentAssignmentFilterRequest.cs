using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ExamStudentAssignmentFilterRequest : BaseRequestSecond
    {
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tên học sinh không được chỉ chứa khoảng trắng")]
        public string? StudentName { get; set; }

        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Số báo danh không được chỉ chứa khoảng trắng")]
        public string? IdentificationNumber { get; set; }
    }
}
