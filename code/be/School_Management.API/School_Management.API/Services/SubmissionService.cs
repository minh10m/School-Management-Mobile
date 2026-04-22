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
                "BIGGER_THAN_MAXSIZE" => throw new BadRequestException("Dung lượng tối đa cho file chỉ được phép là 20MB"),
                "UPLOAD_FILE_FAILED" => throw new BadRequestException("Upload file thất bại"),
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

        public async Task<SubmissionResponse> UpdateSubmission(SubmissionUpdateRequest request, Guid submissionId)
        {
            var (result, message) = await submissionRepository.UpdateSubmission(request, submissionId);
            return message switch
            {
                "NOT_FOUND_SUBMISSION" => throw new NotFoundException("Không tìm thấy bài nộp ban đầu"),
                "SUBMISSION_HAS_SCORE" => throw new ForbiddenException("Bài nộp đã được chấm, không thể cập nhật"),
                "BIGGER_THAN_MAXSIZE" => throw new BadRequestException("Dung lượng tối đa của file là 20MB"),
                "UPLOAD_FAILED" => throw new BadRequestException("Upload file thất bại"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }
    }
}
