using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface ISubmissionRepository
    {
        public Task<(SubmissionResponse? data, string? message)> CreateSubmission(SubmissionRequest request, Guid userId);
        public Task<(PagedResponse<SubmissionResponse>? data, string? message)> GetAllSubmissionOfAssignmentForTeacher(SubmissionFilterRequest request, Guid userId);
        public Task<(SubmissionResponse? data, string? message)> GetSubmissionById(Guid submissionId);
        public Task<(SubmissionResponse? data, string? message)> GetSubmissionOfAssignmentForStudent(SubmissionStudentRequest request, Guid userId);

    }
}
