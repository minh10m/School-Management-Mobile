using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ExamScheduleDetailFilterRequest : BaseRequestSecond
    {

        public string? SubjectName { get; set; } = string.Empty;

        public string? TeacherName { get; set; }

    }
}
