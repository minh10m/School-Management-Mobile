using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface ILessonAssignmentRepository
    {
        public Task<(LessonAssignmentResponse? data, string message)> CreateLessonAssignment(LessonAssignmentRequest request);
        public Task<(LessonAssignmentResponse? data, string mesaage)> UpdateLessonAssignment(UpdateLessonAssignmentRequest request, Guid lessonAssignmentId);
        public Task<(PagedResponse<LessonAssignmentResponse>? data, string message)> GetAllLessonAssignment(LessonAssignmentFilterRequest request);
        public Task<(LessonAssignmentResponse? data, string message)> GetLessonAssignmentById(Guid lessonAssignmentId);

    }
}
