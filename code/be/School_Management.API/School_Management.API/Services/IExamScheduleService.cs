using School_Management.API.Models.DTO;
using System.Security.Claims;

namespace School_Management.API.Services
{
    public interface IExamScheduleService
    {
        public Task<ExamScheduleResponse> CreateExamSchedule(ExamScheduleRequest request);
        public Task<bool> CreateExamScheduleDetail(IFormFile file, Guid examScheduleId);
        public Task<bool> AssignStudentIntoExamScheduleDetail(Guid examScheduleId);
        public Task<ExamScheduleResponse> UpdateExamSchedule(ExamScheduleRequest request, Guid examScheduleId);
        public Task<ExamScheduleDetailResponse> UpdateExamScheduleDetail(UpdateExamScheduleDetail request, Guid examScheduleDetailId);
        public Task<PagedResponse<ExamScheduleDetailResponse>> GetAllExamScheduleDetail(ExamScheduleDetailFilterRequest request, Guid examScheduleId);
        public Task<PagedResponse<ExamStudentAssignmentResponse>> GetAllExamStudentAssignment(ExamStudentAssignmentFilterRequest request, Guid examScheduleDetailId);
        public Task<List<MyExamScheduleDetailResponse>> GetMyExamSchedule(MyExamScheduleDetailRequest request, ClaimsPrincipal User);
    }
}
