using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IExamScheduleRepository
    {
        public Task<(ExamScheduleResponse? data, string? message)> CreateExamSchedule(ExamScheduleRequest request);

    }
}
