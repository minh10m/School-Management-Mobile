using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class ScheduleRepository : IScheduleRepository
    {
        private readonly ApplicationDbContext context;
        private readonly IStudentRepository studentRepository;

        public ScheduleRepository(ApplicationDbContext context, IStudentRepository studentRepository)
        {
            this.context = context;
            this.studentRepository = studentRepository;
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
                IsActive = request.IsActive,
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
                IsActive = schedule.IsActive,
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
        public string GetVietNameseDay(DayOfWeek dayOfWeek) => dayOfWeek switch
        {
            DayOfWeek.Sunday => "chủ nhật",
            DayOfWeek.Monday => "thứ hai",
            DayOfWeek.Tuesday => "thứ ba",
            DayOfWeek.Wednesday => "thứ tư",
            DayOfWeek.Thursday => "thứ năm",
            DayOfWeek.Friday => "thứ sáu",
            DayOfWeek.Saturday => "thứ bảy",
            _ => "Không xác định"
        };
        public async Task<List<ScheduleDetailResponse>> GetMyScheduleForStudent(ScheduleDetailIsActiveRequest request, Guid studentId)
        {
            var classYearId = await context.ClassYear
                                           .Where(x => x.StudentClassYears.Any(sc => sc.Student.Id == studentId) && x.SchoolYear == request.SchoolYear)
                                           .Select(x => x.Id)
                                           .FirstOrDefaultAsync();
            if (classYearId == Guid.Empty) return null;

            var scheduleDetailList = await context.ScheduleDetail
                                                  .Where(x => x.Schedule.ClassYearId == classYearId
                                                  && x.Schedule.Term == request.Term
                                                  && x.Schedule.IsActive == true)
                                                  .Select(g => new ScheduleDetailResponse
                                                  {
                                                     ScheduleDetailId = g.Id,
                                                     ScheduleId = g.ScheduleId,
                                                     StartTime = g.StartTime,
                                                     FinishTime = g.FinishTime,
                                                     TeacherSubjectId = g.TeacherSubjectId,
                                                     TeacherName = g.TeacherSubject.Teacher.User.FullName,
                                                     SubjectName = g.TeacherSubject.Subject.SubjectName,
                                                     DayOfWeek = g.DayOfWeek,
                                                  })
                                                  .OrderBy(x => x.DayOfWeek)
                                                  .ThenBy(x => x.StartTime)
                                                  .ToListAsync();

            foreach(var item in scheduleDetailList)
            {
                item.DayOfWeekVietNamese = GetVietNameseDay(item.DayOfWeek);
            }

            return scheduleDetailList;

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
            schedule.IsActive = request.IsActive;
            schedule.ClassYearId = request.ClassYearId;

            await context.SaveChangesAsync();
            return new ScheduleResponse
            {
                Term = schedule.Term,
                SchoolYear = schedule.SchoolYear,
                ClassYearId = schedule.ClassYearId,
                Name = schedule.Name,
                IsActive = schedule.IsActive,
                ScheduleId = schedule.Id,
                ClassName = className
            };

        }

        public async Task<List<TeacherScheduleDetailResponse>> GetMyScheduleForTeacher(ScheduleDetailIsActiveRequest request, Guid teacherId)
        {
            var ScheduleDetailList = await context.ScheduleDetail
                                                  .AsNoTracking()
                                                  .Where(x => x.Schedule.IsActive == true
                                                  && x.Schedule.SchoolYear == request.SchoolYear
                                                  && x.Schedule.Term == request.Term
                                                  && x.TeacherSubject.TeacherId == teacherId)
                                                  .Select(g => new TeacherScheduleDetailResponse
                                                  {
                                                      DayOfWeek = g.DayOfWeek,
                                                      ScheduleDetailId = g.Id,
                                                      FinishTime = g.FinishTime,
                                                      StartTime = g.StartTime,
                                                      SubjectName = g.TeacherSubject.Subject.SubjectName,
                                                      ClassName = g.Schedule.ClassYear.ClassName
                                                  })
                                                  .OrderBy(x => x.DayOfWeek)
                                                  .ThenBy(x => x.StartTime)
                                                  .ToListAsync();
            foreach(var item in ScheduleDetailList)
            {
                item.DayOfWeekVietNamese = GetVietNameseDay(item.DayOfWeek);
            }
            return ScheduleDetailList;
        }
    }
}
