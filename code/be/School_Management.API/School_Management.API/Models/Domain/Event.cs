using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.Domain
{
    public class Event
    {
        [Key]
        public Guid Id { get; set; }
        public string? Title { get; set; }
        public string? Body { get; set; }
        public DateTimeOffset StartTime { get; set; }
        public DateTimeOffset FinishTime { get; set; }
        public int SchoolYear { get; set; }
        public int Term { get; set; }
    }
}
