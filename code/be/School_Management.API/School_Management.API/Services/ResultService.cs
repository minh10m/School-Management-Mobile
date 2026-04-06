using School_Management.API.Exceptions;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;
using System.Runtime.InteropServices;

namespace School_Management.API.Services
{
    public class ResultService : IResultService
    {
        private readonly IResultRepository resultRepository;

        public ResultService(IResultRepository resultRepository)
        {
            this.resultRepository = resultRepository;
        }
        public async Task<bool> CreateResult(List<ResultRequest> requests)
        {
            var (result, message) = await resultRepository.CreateResult(requests);
            return message switch
            {
                "CONFLICT_TYPE" => throw new ConflictException("Loại điểm số đã tồn tại"),
                "DUPLICATED_TYPE" => throw new BadRequestException("Danh sách gửi lên có 2 loại điểm của một học sinh bị trùng nhau"),
                "SUCCESS" => result,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<List<ResultForStudentResponse>> GetMyResultForStudent(ResultOfStudentRequest request, Guid userId)
        {
            var (result, message) = await resultRepository.GetMyResultForStudent(request, userId);
            return message switch
            {
                "NOT_FOUND_STUDENT" => throw new NotFoundException("Bạn không phải là một học sinh"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<List<StudentResultForTeacherResponse>> GetResultOfAllStudentInClass(ResultOfStudentRequest request, Guid userId)
        {
            var (result, message) = await resultRepository.GetResultOfAllStudentInClass(request, userId);
            return message switch
            {
                "NOT_FOUND_TEACHER" => throw new NotFoundException("Bạn không là giáo viên"),
                "NOT_FOUND_CLASS" => throw new NotFoundException("Bạn không chủ nhiệm lớp học nào"),
                "EMPTY_LIST" => throw new NotFoundException("Lớp chưa có học sinh"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<ResultResponse> UpdateResult(UpdateResultRequest request, Guid resultId, Guid userId)
        {
            var (result, message) = await resultRepository.UpdateResult(request, resultId, userId);
            return message switch
            {
                "NOT_FOUND_RESULT" => throw new NotFoundException("Kết quả học tập không tồn tại"),
                "NOT_FOUND_TEACHER" => throw new NotFoundException("Bạn không là giáo viên"),
                "IS_NOT_TEACHER_OF_SUBJECT" => throw new ForbiddenException("Bạn không là giáo viên phụ trách môn này"),
                "DUPLICATED_TYPE" => throw new BadRequestException("Học sinh này đã có đầu điểm này trong học kỳ và năm học đã chọn"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }
    }
}
