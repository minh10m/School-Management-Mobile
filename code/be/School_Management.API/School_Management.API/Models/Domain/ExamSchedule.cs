using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.Domain
{
    public class ExamSchedule
    {
        [Key]
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public int Term { get; set; }
        public int SchoolYear { get; set; }
        public int Grade { get; set; }
        public bool IsActive { get; set; }

        //Navigation properties
        public ICollection<ExamScheduleDetail> ExamScheduleDetails { get; set; } = new List<ExamScheduleDetail>();
    }
}
