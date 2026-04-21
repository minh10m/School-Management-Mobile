using School_Management.API.Exceptions;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class AssignmentService : IAssignmentService
    {
        private readonly IAssignmentRepository assignmentRepository;

        public AssignmentService(IAssignmentRepository assignmentRepository)
        {
            this.assignmentRepository = assignmentRepository;
        }
        public async Task<AssignmentResponse> CreateAssignment(PostOrUpdateAssignmentRequest request, Guid userId)
        {
            var (result, message) = await assignmentRepository.CreateAssignment(request, userId);
            return message switch
            {
                "NOT_FOUND_TEACHER" => throw new NotFoundException("Bạn không phải là giáo viên"),
                "FORBIDDEN_TEACHER_SUBJECT" => throw new ForbiddenException("Bạn không phải giáo viên dạy môn học này"),
                "CONFLICT_TITLE" => throw new ConflictException("Tên tiêu đề bài tập đã tồn tại ở môn học này"),
                "SUCCESS" => result!,
                "BIGGER_THAN_MAXSIZE" => throw new BadRequestException("Dung lượng tối đa cho file chỉ được phép là 20MB"),
                "UPLOAD_FILE_FAILED" => throw new BadRequestException("Upload file thất bại"),
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<PagedResponse<AssignmentListResponse>> GetAllAssignment(AssignmentFilterRequest request, Guid userId)
        {
            return await assignmentRepository.GetAllAssignment(request, userId);
        }

        public async Task<AssignmentResponse> GetAssignmentById(Guid assignmentId)
        {
            var (result, message) = await assignmentRepository.GetAssignmentById(assignmentId);
            return message switch
            {
                "NOT_FOUND_ASSIGNMENT" => throw new NotFoundException("Không tìm thấy bài tập này"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<PagedResponse<AssignmentResponseForStudent>> GetMyAssignmentsForStudent(AssignmentForStudentRequest request, Guid userId)
        {
            var (result, message) = await assignmentRepository.GetMyAssignmentsForStudent(request, userId);
            return message switch
            {
                "NOT_FOUND_STUDENT" => throw new NotFoundException("Bạn không phải là một học sinh"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")

            };
        }

        public async Task<AssignmentResponse> UpdateAssignment(PostOrUpdateAssignmentRequest request, Guid userId, Guid assignmentId)
        {
            var (result, message) = await assignmentRepository.UpdateAssignment(request, userId, assignmentId);
            return message switch
            {
                "NOT_FOUND_TEACHER" => throw new NotFoundException("Bạn không phải là giáo viên"),
                "FORBIDDEN_TEACHER_SUBJECT" => throw new ForbiddenException("Bạn không phải giáo viên dạy môn học này"),
                "CONFLICT_TITLE" => throw new ConflictException("Tên tiêu đề bài tập đã tồn tại ở môn học này"),
                "SUCCESS" => result!,
                "NOT_FOUND_ASSIGNMENT" => throw new NotFoundException("Không tìm thấy bài tập để sửa thông tin"),
                _ => throw new Exception("Lỗi không xác định")
            };
        }
    }
}
