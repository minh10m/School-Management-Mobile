using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IAssignmentRepository
    {
        public Task<(AssignmentResponse? data, string? message)> CreateAssignment(PostOrUpdateAssignmentRequest request, Guid userId);

    }
}
