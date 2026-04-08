using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.Domain
{
    public class Event
    {
        [Key]
        public Guid Id { get; set; }
        public string? Title { get; set; }
        public string? Body { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan FinishTime { get; set; }
        public DateOnly EventDate { get; set; }
        public int SchoolYear { get; set; }
        public int Term { get; set; }
    }
}
