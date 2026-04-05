using School_Management.API.Exceptions;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class SubmissionService : ISubmissionService
    {
        private readonly ISubmissionRepository submissionRepository;

        public SubmissionService(ISubmissionRepository submissionRepository)
        {
            this.submissionRepository = submissionRepository;
        }
        public async Task<SubmissionResponse> CreateSubmission(SubmissionRequest request, Guid userId)
        {
            var (result, message) = await submissionRepository.CreateSubmission(request, userId);
            return message switch
            {
                "NOT_FOUND_STUDENT" => throw new NotFoundException("Bạn không phải là học sinh"),
                "NOT_FOUND_ASSIGNMENT" => throw new NotFoundException("Không thể nộp bài cho bài tập này"),
                "TOO_FAST_REQUEST" => throw new ConflictException("Bạn đã nộp bài rồi"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<PagedResponse<SubmissionResponse>> GetAllSubmissionOfAssignmentForTeacher(SubmissionFilterRequest request, Guid userId)
        {
            var (result, message) = await submissionRepository.GetAllSubmissionOfAssignmentForTeacher(request, userId);
            return message switch
            {
                "NOT_FOUND_TEACHER" => throw new NotFoundException("Bạn không phải là giáo viên"),
                "NOT_FOUND_ASSIGNMENT" => throw new NotFoundException("Bài tập không tồn tại, không thể tìm thấy danh sách bài nộp"),
                "NOT_A_TEACHER_OF_ASSIGNMENT" => throw new ForbiddenException("Bạn không là giáo viên ra bài tập này"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<SubmissionResponse> GetSubmissionById(Guid submissionId)
        {
            var (result, message) = await submissionRepository.GetSubmissionById(submissionId);
            return message switch
            {
                "NOT_FOUND_SUBMISSION" => throw new NotFoundException("Bài nộp này không tồn tại"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<SubmissionResponse> GetSubmissionOfAssignmentForStudent(SubmissionStudentRequest request, Guid userId)
        {
            var (result, message) = await submissionRepository.GetSubmissionOfAssignmentForStudent(request, userId);
            return message switch
            {
                "NOT_FOUND_STUDENT" => throw new NotFoundException("Bạn không phải là học sinh"),
                "NOT_FOUND_ASSIGNMENT" => throw new NotFoundException("Bài tập không tồn tại, không thể tìm thấy bài nộp"),
                "SUCCESS" => result,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<SubmissionResponse> ScoreSubmission(ScoreSubmissionRequest request, Guid submissionId, Guid userId)
        {
            var (result, message) = await submissionRepository.ScoreSubmission(request, submissionId, userId);
            return message switch
            {
                "NOT_FOUND_SUBMISSION" => throw new NotFoundException("Không tìm thấy bài nộp"),
                "NOT_FOUND_TEACHER" => throw new NotFoundException("Bạn không phải là giáo viên"),
                "NOT_A_TEACHER_OF_ASSIGNMENT" => throw new ForbiddenException("Bạn không là giáo viên ra bài tập này"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }
    }
}
