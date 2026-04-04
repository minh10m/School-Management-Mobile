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
                _ => throw new Exception("Lỗi không xác định")
            };
        }
    }
}
