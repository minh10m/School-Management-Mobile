using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IExamScheduleService
    {
        public Task<ExamScheduleResponse> CreateExamSchedule(ExamScheduleRequest request);
        public Task<bool> CreateExamScheduleDetail(IFormFile file, Guid examScheduleId);
        public Task<bool> AssignStudentIntoExamScheduleDetail(Guid examScheduleId);
        public Task<ExamScheduleResponse> UpdateExamSchedule(ExamScheduleRequest request, Guid examScheduleId);
        public Task<ExamScheduleDetailResponse> UpdateExamScheduleDetail(UpdateExamScheduleDetail request, Guid examScheduleDetailId);

    }
}
