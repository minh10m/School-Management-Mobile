using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface ICourseAssignmentRepository
    {
        public Task<(CourseAssignmentResponse? data, string message)> CreateCourseAssignment(CourseAssignmentRequest request);

    }
}
