using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface ICourseAssignmentRepository
    {
        public Task<(CourseAssignmentResponse? data, string message)> CreateCourseAssignment(CourseAssignmentRequest request);
        public Task<(CourseAssignmentResponse? data, string mesaage)> UpdateCourseAssignment(UpdateCourseAssignmentRequest request, Guid courseAssignmentId);
        public Task<(PagedResponse<CourseAssignmentResponse>? data, string message)> GetAllCourseAssigment(CourseAssignmentFilterRequest request);
        public Task<(CourseAssignmentResponse? data, string message)> GetCourseAssignmentById(Guid courseAssignmentId);

    }
}
