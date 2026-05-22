using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class CourseFilterRequestAdmin : BaseRequestSecond
    {
        public string Status { get; set; } = string.Empty;

        public string CourseName { get; set; } = string.Empty;

        public Guid? SubjectId { get; set; }

        public decimal? MinPrice { get; set; }

        public decimal? MaxPrice { get; set; }
    }
}
