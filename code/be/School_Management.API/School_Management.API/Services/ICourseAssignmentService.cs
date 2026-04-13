using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface ICourseAssignmentService
    {
        public Task<CourseAssignmentResponse> CreateCourseAssignment(CourseAssignmentRequest request);
        public Task<CourseAssignmentResponse> UpdateCourseAssignment(UpdateCourseAssignmentRequest request, Guid courseAssignmentId);
        public Task<PagedResponse<CourseAssignmentResponse>> GetAllCourseAssigment(CourseAssignmentFilterRequest request);
        public Task<CourseAssignmentResponse> GetCourseAssignmentById(Guid courseAssignmentId);
    }
}
