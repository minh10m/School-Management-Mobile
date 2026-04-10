using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IExamScheduleRepository
    {
        public Task<(ExamScheduleResponse? data, string? message)> CreateExamSchedule(ExamScheduleRequest request);
        public List<ExamScheduleDetailRequest> ReadExcelData(IFormFile file);

        public Task<(bool result, string? message)> CreateExamScheduleDetail(IFormFile file, Guid examScheduleId);
        public Task<(bool result, string? message)> AssignStudentIntoExamScheduleDetail(Guid examScheduleId);
        public Task<(ExamScheduleResponse? data, string? message)> UpdateExamSchedule(ExamScheduleRequest request, Guid examScheduleId);

    }
}
