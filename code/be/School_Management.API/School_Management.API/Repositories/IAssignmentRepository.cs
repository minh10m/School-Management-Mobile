using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IAssignmentRepository
    {
        public Task<(AssignmentResponse? data, string? message)> CreateAssignment(PostOrUpdateAssignmentRequest request, Guid userId);
        public Task<(AssignmentResponse? data, string? message)> UpdateAssignment(PostOrUpdateAssignmentRequest request, Guid userId, Guid assignmentId);
        public Task<PagedResponse<AssignmentListResponse>> GetAllAssignment(AssignmentFilterRequest request);
        public Task<(AssignmentResponse? data, string? message)> GetAssignmentById(Guid assignmentId);

    }
}
