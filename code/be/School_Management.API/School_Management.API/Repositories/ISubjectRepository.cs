using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface ISubjectRepository
    {
        public Task<SubjectResponse?> CreateSubject(PostOrUpdateSubjectRequest request);
        public Task<(SubjectResponse? data, string? errorCode)> UpdateSubject(PostOrUpdateSubjectRequest request, Guid subjectId);
    }
}
