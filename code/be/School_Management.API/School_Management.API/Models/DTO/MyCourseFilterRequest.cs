using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class MyCourseFilterRequest : BaseRequestSecond
    {
        public string? CourseName { get; set; }
    }
}
