namespace School_Management.API.Models.DTO
{
    public class ResultResponse
    {
        public Guid ResultId { get; set; }
        public string Type { get; set; } = string.Empty;
        public float Value { get; set; }
        public Guid StudentId { get; set; }
        public Guid SubjectId { get; set; }
        public int Term { get; set; }
        public int Weight { get; set; }
        public int SchoolYear { get; set; }
    }
}
