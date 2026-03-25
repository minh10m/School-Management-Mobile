using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class ScheduleRepository : IScheduleRepository
    {
        private readonly ApplicationDbContext context;

        public ScheduleRepository(ApplicationDbContext context)
        {
            this.context = context;
        }
        public async Task<ScheduleResponse?> CreateSchedule(PostUpdateScheduleRequest request)
        {
            var isExisted = await context.Schedule
                                      .AnyAsync(x => x.Name == request.Name && x.SchoolYear == request.SchoolYear
                                      && x.Term == request.Term && x.ClassYearId == request.ClassYearId);
                                      
            if (isExisted) return null;

            var className = await context.ClassYear
                                         .Where(x => x.Id == request.ClassYearId)
                                         .Select(x => x.ClassName)
                                         .FirstOrDefaultAsync();
            
            var schedule = new Schedule
            {
                Id = Guid.NewGuid(),
                Term = request.Term,
                SchoolYear = request.SchoolYear,
                Name = request.Name,
                ClassYearId = request.ClassYearId
            };

            context.Schedule.Add(schedule);
            await context.SaveChangesAsync();
            return new ScheduleResponse
            {
                Term = schedule.Term,
                SchoolYear = schedule.SchoolYear,
                ClassYearId = schedule.ClassYearId,
                Name = schedule.Name,
                ScheduleId = schedule.Id,
                ClassName = className

            };
        }

        public async Task<Schedule?> FindScheduleById(Guid scheduleId)
        {
            var schedule = await context.Schedule
                                        .Where(x => x.Id == scheduleId)
                                        .FirstOrDefaultAsync();
            return schedule;
        }

        public async Task<ScheduleResponse?> UpdateSchedule(PostUpdateScheduleRequest request, Schedule schedule)
        {
            var isExisted = await context.Schedule
                                      .AnyAsync(x => x.Id != schedule.Id 
                                      && x.Name == request.Name 
                                      && x.SchoolYear == request.SchoolYear
                                      && x.Term == request.Term 
                                      && x.ClassYearId == request.ClassYearId);

            if (isExisted) return null;
            if(request.ClassYearId != schedule.ClassYearId)
            {
                var oldDetails = await context.ScheduleDetail
                                              .Where(x => x.ScheduleId == schedule.Id)
                                              .ExecuteDeleteAsync();

            }

            var className = await context.ClassYear
                                         .Where(x => x.Id == request.ClassYearId)
                                         .Select(x => x.ClassName)
                                         .FirstOrDefaultAsync();
            schedule.Name = request.Name;
            schedule.SchoolYear = request.SchoolYear;
            schedule.Term = request.Term;
            schedule.ClassYearId = request.ClassYearId;

            await context.SaveChangesAsync();
            return new ScheduleResponse
            {
                Term = schedule.Term,
                SchoolYear = schedule.SchoolYear,
                ClassYearId = schedule.ClassYearId,
                Name = schedule.Name,
                ScheduleId = schedule.Id,
                ClassName = className
            };

        }
    }
}
