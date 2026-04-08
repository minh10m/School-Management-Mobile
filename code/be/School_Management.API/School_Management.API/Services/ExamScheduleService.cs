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
    }
}
