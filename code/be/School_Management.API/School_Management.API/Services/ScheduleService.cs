using School_Management.API.Exceptions;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class ScheduleService : IScheduleService
    {
        private readonly IScheduleRepository scheduleRepository;

        public ScheduleService(IScheduleRepository scheduleRepository)
        {
            this.scheduleRepository = scheduleRepository;
        }
        public async Task<ScheduleResponse?> CreateSchedule(PostUpdateScheduleRequest request)
        {
            var result = await scheduleRepository.CreateSchedule(request);
            if (result == null) throw new ConflictException("This class have already had this schedule");
            return result;

        }

        public Task<List<ScheduleDetailResponse>> CreateScheduleDetail(PostUpdateScheduleDetailRequest request, Guid scheduleId)
        {
            throw new NotImplementedException();
        }
    }
}
