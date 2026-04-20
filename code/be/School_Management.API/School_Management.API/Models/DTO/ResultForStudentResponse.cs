namespace School_Management.API.Models.DTO
{
    public class ResultForStudentResponse
    {
        public List<SubjectResultR> SubjectResults { get; set; } = new List<SubjectResultR>();
        public float? Average { get; set; } 
        public string? Rating { get; set; } 

    }

    public class SubjectResultR
    {
        public Guid SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public float AverageSubject { get; set; }
        public List<DetailResult> DetailResults { get; set; } = new List<DetailResult>();
    }

    public class DetailResult
    {
        public Guid ResultId { get; set; }
        public string Type { get; set; } = string.Empty;
        public float Value { get; set; }
        public int Weight { get; set; }
    }
}
