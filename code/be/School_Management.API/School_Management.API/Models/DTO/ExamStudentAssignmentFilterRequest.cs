using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ExamStudentAssignmentFilterRequest : BaseRequestSecond
    {
        public string? StudentName { get; set; }

        public string? IdentificationNumber { get; set; }
    }
}
