using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface ISubmissionRepository
    {
        public Task<(SubmissionResponse? data, string? message)> CreateSubmission(SubmissionRequest request, Guid userId);

    }
}
