using School_Management.API.Exceptions;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class ExamScheduleService : IExamScheduleService
    {
        private readonly IExamScheduleRepository examScheduleRepository;

        public ExamScheduleService(IExamScheduleRepository examScheduleRepository)
        {
            this.examScheduleRepository = examScheduleRepository;
        }

        public async Task<bool> AssignStudentIntoExamScheduleDetail(Guid examScheduleId)
        {
            var (result, message) = await examScheduleRepository.AssignStudentIntoExamScheduleDetail(examScheduleId);
            if (result == false) throw new BadRequestException(message);

            return result;
        }

        public async Task<ExamScheduleResponse> CreateExamSchedule(ExamScheduleRequest request)
        {
            var (result, message) = await examScheduleRepository.CreateExamSchedule(request);
            return message switch
            {
                "CONFLICT_TITLE" => throw new ConflictException("Tên lịch này đã tồn tại, vui lòng đổi sang tên loại khác"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<bool> CreateExamScheduleDetail(IFormFile file, Guid examScheduleId)
        {
            var (result, message) = await examScheduleRepository.CreateExamScheduleDetail(file, examScheduleId);
            if (result == false) throw new BadRequestException(message ?? "Lỗi không xác định");

            return result;
        }

        public async Task<PagedResponse<ExamScheduleDetailResponse>> GetAllExamScheduleDetail(ExamScheduleDetailFilterRequest request, Guid examScheduleId)
        {
            var (result, message) = await examScheduleRepository.GetAllExamScheduleDetail(request, examScheduleId);
            return message switch
            {
                "NOT_FOUND_EXAMSCHEDULE" => throw new NotFoundException("Không tìm thấy lịch thi"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<PagedResponse<ExamStudentAssignmentResponse>> GetAllExamStudentAssignment(ExamStudentAssignmentFilterRequest request, Guid examScheduleDetailId)
        {
            var (result, message) = await examScheduleRepository.GetAllExamStudentAssignment(request, examScheduleDetailId);
            return message switch
            {
                "NOT_FOUND_EXAM_SCHEDULE_DETAIL" => throw new NotFoundException("Không tìm thấy chi tiết lịch thi"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<ExamScheduleResponse> UpdateExamSchedule(ExamScheduleRequest request, Guid examScheduleId)
        {
            var (result, message) = await examScheduleRepository.UpdateExamSchedule(request, examScheduleId);
            return message switch
            {
                "NOT_FOUND_EXAMSCHEDULE" => throw new NotFoundException("Không tìm thấy lịch này"),
                "CONFLICT_TITLE" => throw new ConflictException("Tên lịch thi đã tồn tại"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<ExamScheduleDetailResponse> UpdateExamScheduleDetail(UpdateExamScheduleDetail request, Guid examScheduleDetailId)
        {
            var (result, message) = await examScheduleRepository.UpdateExamScheduleDetail(request, examScheduleDetailId);
            return message switch
            {
                "NOT_FOUND_EXAM_SCHEDULE_DETAIL" => throw new NotFoundException("Không tìm thấy chi tiết lịch thi"),
                "CONFLICT_TEACHER_OR_ROOMNAME" => throw new ConflictException("Trùng giáo viên hoặc phòng thi"),
                "SUCCESS" => result!,
                "CONFLICT_TIME" => throw new BadRequestException("Thời gian bắt đầu không được lớn hơn thời gian kết thúc"),
                _ => throw new Exception("Lỗi không xác định")
            };
        }
    }
}
