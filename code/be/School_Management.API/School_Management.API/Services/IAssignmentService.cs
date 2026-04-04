using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IAssignmentService
    {
        public Task<AssignmentResponse> CreateAssignment(PostOrUpdateAssignmentRequest request, Guid userId);
        public Task<AssignmentResponse> UpdateAssignment(PostOrUpdateAssignmentRequest request, Guid userId, Guid assignmentId);
        public Task<PagedResponse<AssignmentListResponse>> GetAllAssignment(AssignmentFilterRequest request);
        public Task<AssignmentResponse> GetAssignmentById(Guid assignmentId);
    }
}
