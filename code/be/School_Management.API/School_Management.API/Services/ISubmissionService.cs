using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface ISubmissionService
    {
        public Task<SubmissionResponse> CreateSubmission(SubmissionRequest request, Guid userId);
        public Task<PagedResponse<SubmissionResponse>> GetAllSubmissionOfAssignmentForTeacher(SubmissionFilterRequest request, Guid userId);
        public Task<SubmissionResponse> GetSubmissionById(Guid submissionId);
        public Task<SubmissionResponse> GetSubmissionOfAssignmentForStudent(SubmissionStudentRequest request, Guid userId);
        public Task<SubmissionResponse> ScoreSubmission(ScoreSubmissionRequest request, Guid submissionId, Guid userId);
    }
}
