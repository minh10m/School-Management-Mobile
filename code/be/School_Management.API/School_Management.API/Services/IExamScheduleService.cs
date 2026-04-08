using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IExamScheduleService
    {
        public Task<ExamScheduleResponse> CreateExamSchedule(ExamScheduleRequest request);
    }
}
