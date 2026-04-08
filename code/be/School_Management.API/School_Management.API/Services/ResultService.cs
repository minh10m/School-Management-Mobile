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
        public async Task<bool> CreateResult(List<ResultRequest> requests, Guid userId)
        {
            var (result, message) = await resultRepository.CreateResult(requests, userId);
            return message switch
            {
                "CONFLICT_TYPE" => throw new ConflictException("Loại điểm số đã tồn tại"),
                "DUPLICATED_TYPE" => throw new BadRequestException("Danh sách gửi lên có 2 loại điểm của một học sinh bị trùng nhau"),
                "SUCCESS" => result,
                "NOT_FOUND_TEACHER" => throw new NotFoundException("Bạn không phải là giáo viên"),
                "EMPTY_REQUEST" => throw new BadRequestException("Danh sách điểm trống, vui lòng cung cấp thông tin"),
                "NOT_FOUND_CLASSYEAR" => throw new NotFoundException("Không tìm thấy lớp của các học sinh này"),
                "FORBIDDEN_CREATE_RESULT" => throw new ForbiddenException("Có môn học trong danh sách không thuộc sự giảng dạy của bạn"),
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

        public async Task<List<StudentResultForTeacherResponse>> GetResultOfAllStudentInClass(ResultOfAllStudentRequest request, Guid classYearId, Guid userId)
        {
            var (result, message) = await resultRepository.GetResultOfAllStudentInClass(request, classYearId, userId);
            return message switch
            {
                "NOT_FOUND_TEACHER" => throw new NotFoundException("Bạn không là giáo viên"),
                "NOT_FOUND_CLASS" => throw new NotFoundException("Không tìm thấy thông tin lớp học"),
                "EMPTY_LIST" => throw new NotFoundException("Lớp chưa có học sinh"),
                "NOT_HOMEROOM_TEACHER" => throw new ForbiddenException("Bạn không phải là giáo viên chủ nhiệm của lớp này"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<List<ResultForStudentResponse>> GetResultOfOneStudentForTeacher(ResultOfAllStudentRequest request, Guid classYearId, Guid studentId, Guid userId)
        {
            var (result, message) = await resultRepository.GetResultOfOneStudentForTeacher(request, classYearId, studentId, userId);
            return message switch
            {
                "NOT_FOUND_TEACHER" => throw new NotFoundException("Bạn không phải là giáo viên"),
                "NOT_FOUND_CLASS" => throw new  NotFoundException("Không tìm thấy lớp học"),
                "NOT_A_TEACHER_OF_THIS_STUDENT" => throw new ForbiddenException("Bạn không dạy học sinh này"),
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
                "FORBIDDEN_UPDATE_RESULT" => throw new ForbiddenException("Bạn không là giáo viên phụ trách môn này"),
                "NOT_FOUND_CLASSYEAR" => throw new NotFoundException("Không tìm thấy lớp của các học sinh này"),
                "DUPLICATED_TYPE" => throw new BadRequestException("Học sinh này đã có đầu điểm này trong học kỳ và năm học đã chọn"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }
    }
}
