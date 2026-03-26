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
            if (result == null) throw new ConflictException("Lớp học đã có lịch này rồi");
            return result;

        }

        public async Task<bool> ValidateData(PostUpdateScheduleDetailRequest request, Guid scheduleId, Guid? currentDetailId = null)
        {
            var currentSchedule = await context.Schedule
                .Where(x => x.Id == scheduleId)
                .Select(x => new { x.SchoolYear, x.Term })
                .FirstOrDefaultAsync();
            if (currentSchedule == null) throw new NotFoundException("Lịch không tồn tại");

            var isClassBusy = await context.ScheduleDetail
                .AnyAsync(x => x.ScheduleId == scheduleId
                            && (currentDetailId == null || x.Id != currentDetailId) 
                            && x.DayOfWeek == request.DayOfWeek
                            && x.StartTime == request.StartTime);

            if (isClassBusy) throw new BadRequestException($"Lịch học bị trùng vào thứ {request.DayOfWeek} lúc {request.StartTime:hh\\:mm}");

            var teacherId = await context.TeacherSubject
                .Where(x => x.TeacherSubjectId == request.TeacherSubjectId)
                .Select(x => x.TeacherId)
                .FirstOrDefaultAsync();

            if (teacherId == Guid.Empty) throw new NotFoundException("Teacher not found");

            var isTeacherBusy = await context.ScheduleDetail
                .AnyAsync(x => x.Schedule.SchoolYear == currentSchedule.SchoolYear
                            && x.Schedule.Term == currentSchedule.Term
                            && x.TeacherSubject.TeacherId == teacherId
                            && (currentDetailId == null || x.Id != currentDetailId) 
                            && x.DayOfWeek == request.DayOfWeek
                            && x.StartTime == request.StartTime);

            if (isTeacherBusy) throw new BadRequestException($"Giáo viên đã có lịch dạy vào {GetVietNameseDay(request.DayOfWeek)} lúc {request.StartTime:hh\\:mm}");

            return true;
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
        public async Task<int> CreateScheduleDetail(List<PostUpdateScheduleDetailRequest> request, Guid scheduleId)
        {
            var duplicateInList = request
                                .GroupBy(x => new { x.DayOfWeek, x.StartTime })
                                .Any(g => g.Count() > 1);

            if (duplicateInList)
                throw new BadRequestException("Danh sách gửi lên có các tiết học bị trùng giờ với nhau.");
            var periodInRequest = request
                                    .GroupBy(x => x.TeacherSubjectId)
                                    .Select(g => new { TeacherSubjectId = g.Key, Count = g.Count() });
            foreach(var item in periodInRequest)
            {
                var periodInDb = await context.ScheduleDetail
                                              .CountAsync(x => x.ScheduleId == scheduleId
                                              && x.TeacherSubjectId == item.TeacherSubjectId);
                var subjectInfo = await context.TeacherSubject
                                             .Where(x => x.TeacherSubjectId == item.TeacherSubjectId)
                                             .Select(g => new { g.Subject.MaxPeriod, g.Subject.SubjectName})
                                             .FirstOrDefaultAsync();

                if(periodInDb + item.Count > subjectInfo?.MaxPeriod)
                {
                    throw new BadRequestException($"{subjectInfo.SubjectName} đã bị vượt quá số lượng tiết trên " +
                        $"tuần là {subjectInfo.MaxPeriod}, tổng số tiết hiện tại là {periodInDb + item.Count}");
                }
            }

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
            if (schedule == null) throw new NotFoundException("Lịch không tồn tại");

            var result = await scheduleRepository.UpdateSchedule(request, schedule);
            if (result == null) throw new ConflictException("Lớp học đã có lịch này rối");

            return result;
        }

    }
}
