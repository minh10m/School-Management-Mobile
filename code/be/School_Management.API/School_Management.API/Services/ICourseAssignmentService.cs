using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface ICourseAssignmentService
    {
        public Task<CourseAssignmentResponse> CreateCourseAssignment(CourseAssignmentRequest request);
    }
}
