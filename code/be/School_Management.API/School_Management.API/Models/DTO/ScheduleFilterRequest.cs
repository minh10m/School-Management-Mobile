using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ScheduleFilterRequest : BaseRequest
    {
        [Range(1, 2)]
        public int? Term { get; set; }

        public int? SchoolYear { get; set; } 

        public bool? IsActive { get; set; } 
    }
}
