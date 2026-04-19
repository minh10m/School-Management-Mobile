namespace School_Management.API.Models.DTO
{
    public class ClassYearResponse
    {
        public Guid ClassYearId { get; set; }
        public string? ClassName { get; set; }
        public int Grade { get; set; }
        public int SchoolYear { get; set; }
        public Guid HomeRoomId { get; set; }
        public string? HomeRoomName { get; set; }
        public int StudentCount { get; set; }
    }
}
