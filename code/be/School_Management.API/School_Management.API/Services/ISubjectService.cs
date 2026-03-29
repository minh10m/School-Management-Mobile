using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface ISubjectService
    {
        public Task<SubjectResponse> CreateSubject(PostOrUpdateSubjectRequest request);
        public Task<SubjectResponse> UpdateSubject(PostOrUpdateSubjectRequest request, Guid subjectId);
        public Task<List<SubjectResponse>> GetAllSubject(SubjectFilterRequest request);
        public Task<SubjectResponse> GetSubjectById(Guid subjectId);
    }
}
