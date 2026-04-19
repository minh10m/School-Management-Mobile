using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class AssignmentFilterRequest : BaseRequestSecond
    {
        public Guid? ClassYearId { get; set; }
        public string? Title { get; set; }

        public Guid? SubjectId { get; set; }

    }
}
