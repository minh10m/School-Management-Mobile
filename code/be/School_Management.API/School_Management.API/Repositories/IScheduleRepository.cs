using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IScheduleRepository
    {
        public Task<ScheduleResponse?> CreateSchedule(PostUpdateScheduleRequest request);

    }
}
