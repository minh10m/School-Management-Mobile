using School_Management.API.Exceptions;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class CourseAssignmentService : ICourseAssignmentService
    {
        private readonly ICourseAssignmentRepository courseAssignmentRepository;

        public CourseAssignmentService(ICourseAssignmentRepository courseAssignmentRepository)
        {
            this.courseAssignmentRepository = courseAssignmentRepository;
        }
        public async Task<CourseAssignmentResponse> CreateCourseAssignment(CourseAssignmentRequest request)
        {
            var (result, message) = await courseAssignmentRepository.CreateCourseAssignment(request);
            return message switch
            {
                "NOT_FOUND_LESSON" => throw new NotFoundException("Không tìm thấy bài học này"),
                "CONFLICT_TITLE" => throw new ConflictException("Tiêu đề bài học này đã tồn tại"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<PagedResponse<CourseAssignmentResponse>> GetAllCourseAssigment(CourseAssignmentFilterRequest request)
        {
            var (result, message) = await courseAssignmentRepository.GetAllCourseAssigment(request);
            return message switch
            {
                "NOT_FOUND_LESSON" => throw new NotFoundException("Không tìm thấy bài học này"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<CourseAssignmentResponse> UpdateCourseAssignment(UpdateCourseAssignmentRequest request, Guid courseAssignmentId)
        {
            var (result, message) = await courseAssignmentRepository.UpdateCourseAssignment(request, courseAssignmentId);
            return message switch
            {
                "NOT_FOUND_COURSE_ASSIGNMENT" => throw new NotFoundException("Không tìm thấy bài tập của bài học này"),
                "CONFLICT_TITLE" => throw new ConflictException("Tiêu đề bài học này đã tồn tại"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }
    }
}
