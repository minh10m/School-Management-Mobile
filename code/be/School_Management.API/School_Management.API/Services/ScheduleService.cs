using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Exceptions;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class ScheduleService : IScheduleService
    {
        private readonly IScheduleRepository scheduleRepository;
        private readonly ApplicationDbContext context;

        public ScheduleService(IScheduleRepository scheduleRepository, ApplicationDbContext context)
        {
            this.scheduleRepository = scheduleRepository;
            this.context = context;
        }
        public async Task<ScheduleResponse?> CreateSchedule(PostUpdateScheduleRequest request)
        {
            var result = await scheduleRepository.CreateSchedule(request);
            if (result == null) throw new ConflictException("This class have already had this schedule");
            return result;

        }

        public async Task<bool> ValidateData(PostUpdateScheduleDetailRequest request, Guid scheduleId, Guid? currentDetailId = null)
        {
            var currentSchedule = await context.Schedule
                .Where(x => x.Id == scheduleId)
                .Select(x => new { x.SchoolYear, x.Term })
                .FirstOrDefaultAsync();
            if (currentSchedule == null) throw new NotFoundException("This schedule is invalid");

            var isClassBusy = await context.ScheduleDetail
                .AnyAsync(x => x.ScheduleId == scheduleId
                            && (currentDetailId == null || x.Id != currentDetailId) 
                            && x.DayOfWeek == request.DayOfWeek
                            && x.StartTime == request.StartTime);

            if (isClassBusy) throw new BadRequestException($"Lịch học bị trùng vào thứ {request.DayOfWeek} lúc {request.StartTime:hh\\:mm}");

            var teacherSubject = await context.TeacherSubject
                .Where(x => x.TeacherSubjectId == request.TeacherSubjectId)
                .Select(x => new { x.TeacherId, x.SubjectId })
                .FirstOrDefaultAsync();

            if (teacherSubject == null) throw new NotFoundException("TeacherSubject not found");

            var isTeacherBusy = await context.ScheduleDetail
                .AnyAsync(x => x.Schedule.SchoolYear == currentSchedule.SchoolYear
                            && x.Schedule.Term == currentSchedule.Term
                            && x.TeacherSubject.TeacherId == teacherSubject.TeacherId
                            && (currentDetailId == null || x.Id != currentDetailId) 
                            && x.DayOfWeek == request.DayOfWeek
                            && x.StartTime == request.StartTime);

            if (isTeacherBusy) throw new BadRequestException($"Giáo viên đã có lịch dạy vào thứ {request.DayOfWeek} lúc {request.StartTime:hh\\:mm}");

            var totalPeriod = await context.Subject
                .Where(x => x.Id == teacherSubject.SubjectId)
                .Select(x => new { x.MaxPeriod, x.SubjectName })
                .FirstOrDefaultAsync();

            if (totalPeriod == null) throw new NotFoundException("This subject is invalid");

            var currentCountPeriod = await context.ScheduleDetail
                .CountAsync(x => x.ScheduleId == scheduleId
                              && x.TeacherSubjectId == request.TeacherSubjectId
                              && (currentDetailId == null || x.Id != currentDetailId));

            if (currentCountPeriod >= totalPeriod.MaxPeriod)
                throw new BadRequestException($"Môn {totalPeriod.SubjectName} đã đủ {totalPeriod.MaxPeriod} tiết trong tuần.");

            return true;
        }
        public async Task<int> CreateScheduleDetail(List<PostUpdateScheduleDetailRequest> request, Guid scheduleId)
        {
            var duplicateInList = request
                                .GroupBy(x => new { x.DayOfWeek, x.StartTime })
                                .Any(g => g.Count() > 1);

            if (duplicateInList)
                throw new BadRequestException("Danh sách gửi lên có các tiết học bị trùng giờ với nhau.");
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var newDetails = new List<ScheduleDetail>();
                foreach(var item in request)
                {
                    await ValidateData(item, scheduleId, null);
                    var detail = new ScheduleDetail
                    {
                        Id = Guid.NewGuid(),
                        ScheduleId = scheduleId,
                        TeacherSubjectId = item.TeacherSubjectId,
                        DayOfWeek = item.DayOfWeek,
                        StartTime = item.StartTime,
                        FinishTime = item.StartTime.Add(TimeSpan.FromMinutes(45)) 
                    };

                    newDetails.Add(detail);
                }
                await context.ScheduleDetail.AddRangeAsync(newDetails);
                var result = await context.SaveChangesAsync();
                await transaction.CommitAsync();
                return result;

            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<ScheduleResponse?> UpdateSchedule(PostUpdateScheduleRequest request, Guid scheduleId)
        {
            var schedule = await scheduleRepository.FindScheduleById(scheduleId);
            if (schedule == null) throw new NotFoundException("Schedule is invalid");

            var result = await scheduleRepository.UpdateSchedule(request, schedule);
            if (result == null) throw new ConflictException("This class have already had this schedule");

            return result;
        }

    }
}
