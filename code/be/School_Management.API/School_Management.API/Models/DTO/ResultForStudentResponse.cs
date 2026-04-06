namespace School_Management.API.Models.DTO
{
    public class ResultForStudentResponse
    {
        public Guid SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public float Average { get; set; }
        public List<DetailResult> DetailResults { get; set; } = new List<DetailResult>();
    }

    public class DetailResult
    {
        public string Type { get; set; } = string.Empty;
        public float Value { get; set; }
        public int Weight { get; set; }
    }
}
