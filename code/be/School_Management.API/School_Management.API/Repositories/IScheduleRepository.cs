using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IScheduleRepository
    {
        public Task<ScheduleResponse?> CreateSchedule(PostUpdateScheduleRequest request);
        public Task<ScheduleResponse?> UpdateSchedule(PostUpdateScheduleRequest request, Schedule schedule);
        public Task<Schedule?> FindScheduleById(Guid scheduleId);
        public Task<List<TeacherScheduleDetailResponse>> GetMyScheduleForTeacher(ScheduleDetailIsActiveRequest request, Guid teacherId);
        public Task<List<ScheduleDetailResponse>> GetMyScheduleForStudent(ScheduleDetailIsActiveRequest request, Guid studentId);
        public string GetVietNameseDay(DayOfWeek dayOfWeek);


    }
}
