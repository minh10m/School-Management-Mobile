using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class Schedule
    {
        [Key]
        public Guid Id { get; set; }
        public int Term { get; set; }
        public int SchoolYear { get; set; }
        public string? Name { get; set; }
        public Guid ClassYearId { get; set; }
        public bool IsActive { get; set; }


        //Navigation properties
        [ForeignKey("ClassYearId")]
        public ClassYear? ClassYear { get; set; }
        public ICollection<ScheduleDetail> ScheduleDetails { get; set; } = new List<ScheduleDetail>();
    }
}
