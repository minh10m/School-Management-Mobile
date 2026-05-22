using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class CourseFilterRequestTeacherAndStudent : BaseRequestSecond
    {
        public string CourseName { get; set; } = string.Empty;
    }
}
