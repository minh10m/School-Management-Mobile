using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IScheduleService
    {
        public Task<ScheduleResponse?> CreateSchedule(PostUpdateScheduleRequest request);
        public Task<List<ScheduleDetailResponse>> CreateScheduleDetail(PostUpdateScheduleDetailRequest request, Guid scheduleId);
    }
}
