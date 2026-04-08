namespace School_Management.API.Models.DTO
{
    public class ResultResponse
    {
        public Guid ResultId { get; set; }
        public string Type { get; set; } = string.Empty;
        public float Value { get; set; }
        public Guid StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public Guid SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public int Term { get; set; }
        public int Weight { get; set; }
        public int SchoolYear { get; set; }
    }
}
