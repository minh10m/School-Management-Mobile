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
    }
}
