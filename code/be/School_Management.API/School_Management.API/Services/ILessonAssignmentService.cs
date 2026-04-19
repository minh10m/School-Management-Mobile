using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface ILessonAssignmentService
    {
        public Task<LessonAssignmentResponse> CreateLessonAssignment(LessonAssignmentRequest request);
        public Task<LessonAssignmentResponse> UpdateLessonAssignment(UpdateLessonAssignmentRequest request, Guid lessonAssignmentId);
        public Task<PagedResponse<LessonAssignmentResponse>> GetAllLessonAssignment(LessonAssignmentFilterRequest request);
        public Task<LessonAssignmentResponse> GetLessonAssignmentById(Guid lessonAssignmentId);
    }
}
