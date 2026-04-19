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
        private readonly IStudentRepository studentRepository;
        private readonly ITeacherRepository teacherRepository;

        public ScheduleService(IScheduleRepository scheduleRepository, ApplicationDbContext context, IStudentRepository studentRepository, ITeacherRepository teacherRepository)
        {
            this.scheduleRepository = scheduleRepository;
            this.context = context;
            this.studentRepository = studentRepository;
            this.teacherRepository = teacherRepository;
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

            if (teacherId == Guid.Empty) throw new NotFoundException("Giáo viên không tồn tại");

            var isTeacherBusy = await context.ScheduleDetail
                .AnyAsync(x => x.Schedule.SchoolYear == currentSchedule.SchoolYear
                            && x.Schedule.Term == currentSchedule.Term
                            && x.TeacherSubject.TeacherId == teacherId
                            && (currentDetailId == null || x.Id != currentDetailId) 
                            && x.DayOfWeek == request.DayOfWeek
                            && x.StartTime == request.StartTime);

            if (isTeacherBusy) throw new BadRequestException($"Giáo viên đã có lịch dạy vào {scheduleRepository.GetVietNameseDay((DayOfWeek)request.DayOfWeek)} lúc {request.StartTime:hh\\:mm}");

            return true;
        }

        public async Task<int> CreateScheduleDetail(List<PostUpdateScheduleDetailRequest> request, Guid scheduleId)
        {
            var duplicateInList = request
                                .GroupBy(x => new { x.DayOfWeek, x.StartTime })
                                .Any(g => g.Count() > 1);

            if (duplicateInList)
                throw new BadRequestException("Danh sách gửi lên có các tiết học bị trùng giờ với nhau.");
            
            var existTransaction = context.Database.CurrentTransaction;
            using var transaction = existTransaction == null ? await context.Database.BeginTransactionAsync() : null;
            try
            {
                var periodInRequest = request
                                    .GroupBy(x => x.TeacherSubjectId)
                                    .Select(g => new { TeacherSubjectId = g.Key, Count = g.Count() });
                foreach (var item in periodInRequest)
                {
                    var periodInDb = await context.ScheduleDetail
                                                  .CountAsync(x => x.ScheduleId == scheduleId
                                                  && x.TeacherSubjectId == item.TeacherSubjectId);
                    var subjectInfo = await context.TeacherSubject
                                                 .Where(x => x.TeacherSubjectId == item.TeacherSubjectId)
                                                 .Select(g => new { g.Subject.MaxPeriod, g.Subject.SubjectName })
                                                 .FirstOrDefaultAsync();
                    if (subjectInfo == null)
                        throw new NotFoundException($"Không tìm thấy thông tin môn học cho ID: {item.TeacherSubjectId}");

                    if (periodInDb + item.Count > subjectInfo?.MaxPeriod)
                    {
                        throw new BadRequestException($"{subjectInfo.SubjectName} đã bị vượt quá số lượng tiết trên " +
                            $"tuần là {subjectInfo.MaxPeriod}, tổng số tiết hiện tại là {periodInDb + item.Count}");
                    }
                }

                var newDetails = new List<ScheduleDetail>();
                foreach(var item in request)
                {
                    await ValidateData(item, scheduleId, null);
                    var detail = new ScheduleDetail
                    {
                        Id = Guid.NewGuid(),
                        ScheduleId = scheduleId,
                        TeacherSubjectId = (Guid)item.TeacherSubjectId,
                        DayOfWeek = (DayOfWeek)item.DayOfWeek,
                        StartTime = (TimeSpan)item.StartTime,
                        FinishTime = ((TimeSpan)item.StartTime).Add(TimeSpan.FromMinutes(45)) 
                    };

                    newDetails.Add(detail);
                }
                await context.ScheduleDetail.AddRangeAsync(newDetails);
                var result = await context.SaveChangesAsync();

                if(existTransaction == null && transaction != null)
                    await transaction.CommitAsync();

                return result;

            }
            catch (Exception)
            {
                if(existTransaction == null && transaction != null)
                    await transaction.RollbackAsync();

                throw;
            }
        }

        public async Task<ScheduleResponse?> UpdateSchedule(PostUpdateScheduleRequest request, Guid scheduleId)
        {
            var schedule = await scheduleRepository.FindScheduleById(scheduleId);
            if (schedule == null) throw new NotFoundException("Lịch không tồn tại");

            var result = await scheduleRepository.UpdateSchedule(request, schedule);
            if (result == null) throw new ConflictException("Lớp học đã có lịch này rồi");

            return result;
        }

        public async Task<int> UpdateScheduleDetail(List<PostUpdateScheduleDetailRequest> request, Guid scheduleId)
        {

            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var oldDetails = await context.ScheduleDetail
                                              .Where(x => x.ScheduleId == scheduleId)
                                              .ToListAsync();
                context.ScheduleDetail.RemoveRange(oldDetails);
                await context.SaveChangesAsync();

                var result = await CreateScheduleDetail(request, scheduleId);
                await transaction.CommitAsync();
                return result;

            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<List<ScheduleDetailResponse>> GetMyScheduleForStudent(ScheduleDetailIsActiveRequest request, Guid userId)
        {
            var studentId = await studentRepository.GetStudentIdByUserId(userId);
            if (studentId == Guid.Empty) throw new NotFoundException("Học sinh này không tồn tại");

            var result = await scheduleRepository.GetMyScheduleForStudent(request, studentId);
            if (result == null)
                throw new NotFoundException("Không tìm thấy lịch");

            return result;

        }

        public async Task<List<TeacherScheduleDetailResponse>> GetMyScheduleForTeacher(ScheduleDetailIsActiveRequest request, Guid userId)
        {
            var teacherId = await teacherRepository.GetTeacherIdByUserId(userId);
            if (teacherId == Guid.Empty) throw new NotFoundException("Giáo viên không tồn tại");

            var result = await scheduleRepository.GetMyScheduleForTeacher(request, teacherId);
            if (result == null)
                throw new NotFoundException("Không tìm thấy lịch");

            return result;

        }

        public async Task<PagedResponse<ScheduleResponse>> GetAllScheduleForAdmin(ScheduleFilterRequest request)
        {
            return await scheduleRepository.GetAllScheduleForAdmin(request);   
        }

        {
            var result = await scheduleRepository.GetScheduleDetailByScheduleId(scheduleId);
            if (result == null) throw new NotFoundException("Lịch học tổng quát không tồn tại");
            return result;
        }
 
        public async Task<List<ScheduleDetailResponse>> GetActiveScheduleByClassYearId(Guid classYearId, int term, int schoolYear)
        {
            return await scheduleRepository.GetActiveScheduleByClassYearId(classYearId, term, schoolYear);
        }
    }
}
