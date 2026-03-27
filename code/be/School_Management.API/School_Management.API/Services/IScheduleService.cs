using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IScheduleService
    {
        public Task<ScheduleResponse?> CreateSchedule(PostUpdateScheduleRequest request);
        public Task<int> CreateScheduleDetail(List<PostUpdateScheduleDetailRequest> request, Guid scheduleId);
        public Task<ScheduleResponse?> UpdateSchedule(PostUpdateScheduleRequest request, Guid scheduleId);
        public Task<List<ScheduleDetailResponse>> GetMyScheduleForStudent(ScheduleDetailIsActiveRequest request, Guid userId);
        public Task<List<TeacherScheduleDetailResponse>> GetMyScheduleForTeacher(ScheduleDetailIsActiveRequest request, Guid userId);
        public Task<int> UpdateScheduleDetail(List<PostUpdateScheduleDetailRequest> request, Guid scheduleId);
        public Task<bool> ValidateData(PostUpdateScheduleDetailRequest request, Guid scheduleId, Guid? currentDetailId = null);

    }
}
