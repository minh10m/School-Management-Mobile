using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IExamScheduleService
    {
        public Task<ExamScheduleResponse> CreateExamSchedule(ExamScheduleRequest request);
        public Task<bool> CreateExamScheduleDetail(IFormFile file, Guid examScheduleId);

    }
}
