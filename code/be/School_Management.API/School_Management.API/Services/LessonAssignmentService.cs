using School_Management.API.Exceptions;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class LessonAssignmentService : ILessonAssignmentService
    {
        private readonly ILessonAssignmentRepository lessonAssignmentRepository;

        public LessonAssignmentService(ILessonAssignmentRepository lessonAssignmentRepository)
        {
            this.lessonAssignmentRepository = lessonAssignmentRepository;
        }
        public async Task<LessonAssignmentResponse> CreateLessonAssignment(LessonAssignmentRequest request)
        {
            var (result, message) = await lessonAssignmentRepository.CreateLessonAssignment(request);
            return message switch
            {
                "NOT_FOUND_LESSON" => throw new NotFoundException("Không tìm thấy bài học này"),
                "CONFLICT_TITLE" => throw new ConflictException("Tiêu đề bài học này đã tồn tại"),
                "SUCCESS" => result!,
                "BIGGER_THAN_MAXSIZE" => throw new BadRequestException("Dung lượng tối đa cho file chỉ được phép là 20MB"),
                "UPLOAD_FILE_FAILED" => throw new BadRequestException("Upload file thất bại"),
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<PagedResponse<LessonAssignmentResponse>> GetAllLessonAssignment(LessonAssignmentFilterRequest request)
        {
            var (result, message) = await lessonAssignmentRepository.GetAllLessonAssignment(request);
            return message switch
            {
                "NOT_FOUND_LESSON" => throw new NotFoundException("Không tìm thấy bài học này"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<LessonAssignmentResponse> GetLessonAssignmentById(Guid lessonAssignmentId)
        {
            var (result, message) = await lessonAssignmentRepository.GetLessonAssignmentById(lessonAssignmentId);
            return message switch
            {
                "NOT_FOUND_COURSE_ASSIGNMENT" => throw new NotFoundException("Không tìm thấy bài tập của bài học này"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<LessonAssignmentResponse> UpdateLessonAssignment(UpdateLessonAssignmentRequest request, Guid lessonAssignmentId)
        {
            var (result, message) = await lessonAssignmentRepository.UpdateLessonAssignment(request, lessonAssignmentId);
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
