namespace School_Management.API.Models.DTO
{
    public class StudentResultForTeacherResponse
    {
        public Guid StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public List<SubjectResult> SubjectResults { get; set; } = new List<SubjectResult>();
        public float Average { get; set; }
        public string Rating { get; set; } = string.Empty;
    }

    public class SubjectResult
    {
        public Guid SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public float AverageSubject { get; set; }
    }
}
