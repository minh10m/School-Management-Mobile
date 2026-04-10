using School_Management.API.Exceptions;
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
                "CONFLICT_TYPE" => throw new ConflictException("Loại lịch này đã tồn tại, vui lòng đổi sang tên loại khác"),
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
    }
}
