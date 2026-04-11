using School_Management.API.Models.DTO;
using System.Security.Claims;

namespace School_Management.API.Repositories
{
    public interface IExamScheduleRepository
    {
        public Task<(ExamScheduleResponse? data, string? message)> CreateExamSchedule(ExamScheduleRequest request);
        public List<ExamScheduleDetailRequest> ReadExcelData(IFormFile file);

        public Task<(bool result, string? message)> CreateExamScheduleDetail(IFormFile file, Guid examScheduleId);
        public Task<(bool result, string? message)> AssignStudentIntoExamScheduleDetail(Guid examScheduleId);
        public Task<(ExamScheduleResponse? data, string? message)> UpdateExamSchedule(ExamScheduleRequest request, Guid examScheduleId);
        public Task<(ExamScheduleDetailResponse? data, string? message)> UpdateExamScheduleDetail(UpdateExamScheduleDetail request, Guid examScheduleDetailId);
        public Task<(PagedResponse<ExamScheduleDetailResponse>? data, string? message)> GetAllExamScheduleDetail(ExamScheduleDetailFilterRequest request, Guid examScheduleId);
        public Task<(PagedResponse<ExamStudentAssignmentResponse>? data, string? message)> GetAllExamStudentAssignment(ExamStudentAssignmentFilterRequest request, Guid examScheduleDetailId);
        public Task<(List<MyExamScheduleDetailResponse>? data, string? message)> GetMyExamSchedule(MyExamScheduleDetailRequest request, ClaimsPrincipal User);

    }
}
