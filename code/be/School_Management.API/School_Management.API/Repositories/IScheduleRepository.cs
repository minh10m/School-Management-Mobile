using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IScheduleRepository
    {
        public Task<ScheduleResponse?> CreateSchedule(PostUpdateScheduleRequest request);
        public Task<ScheduleResponse?> UpdateSchedule(PostUpdateScheduleRequest request, Schedule schedule);
        public Task<Schedule?> FindScheduleById(Guid scheduleId);

    }
}
