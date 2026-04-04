using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IAssignmentService
    {
        public Task<AssignmentResponse> CreateAssignment(PostOrUpdateAssignmentRequest request, Guid userId);
    }
}
