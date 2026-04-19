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
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                if(request.IsActive)
                {
                    var activeTrueSchedule = await context.Schedule.Where(x => x.SchoolYear == request.SchoolYear
                                                                            && x.Term == request.Term
                                                                            && x.IsActive == true 
                                                                            && x.ClassYearId == request.ClassYearId).FirstOrDefaultAsync();
                    if (activeTrueSchedule != null)
                        activeTrueSchedule.IsActive = false;
                }
                else
                {
                    var isExisted = await context.Schedule
                                         .AnyAsync(x => x.Name == request.Name && x.SchoolYear == request.SchoolYear
                                         && x.Term == request.Term && x.ClassYearId == request.ClassYearId && x.IsActive == request.IsActive);

                    if (isExisted) return null;
                }
                   

                var className = await context.ClassYear
                                             .Where(x => x.Id == request.ClassYearId)
                                             .Select(x => x.ClassName)
                                             .FirstOrDefaultAsync();

                var schedule = new Schedule
                {
                    Id = Guid.NewGuid(),
                    Term = (int)request.Term,
                    SchoolYear = (int)request.SchoolYear,
                    Name = request.Name,
                    IsActive = (bool)request.IsActive,
                    ClassYearId = request.ClassYearId
                };

                context.Schedule.Add(schedule);
                await context.SaveChangesAsync();
                await transaction.CommitAsync();
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
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
            
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
            // 1. Tìm thông tin lớp (Tên lớp & Khối) mà học sinh đang học trong năm này
            var studentClassInfo = await context.ClassYear
                                                .Where(x => x.StudentClassYears.Any(sc => sc.StudentId == studentId) && x.SchoolYear == request.SchoolYear)
                                                .Select(x => new { x.Grade, x.ClassName })
                                                .FirstOrDefaultAsync();

            if (studentClassInfo == null) return null;

            // 2. Tìm lịch học có trạng thái Đang Sử Dụng khớp với Tên lớp + Khối + Học kỳ + Năm học
            // Cách này đảm bảo kể cả khi có ID lớp bị trùng lặp, học sinh vẫn thấy được lịch đúng
            var scheduleDetailList = await context.ScheduleDetail
                                                  .Where(x => x.Schedule.ClassYear.Grade == studentClassInfo.Grade
                                                  && x.Schedule.ClassYear.ClassName == studentClassInfo.ClassName
                                                  && x.Schedule.Term == request.Term
                                                  && x.Schedule.SchoolYear == request.SchoolYear
                                                  && x.Schedule.IsActive == true)
                                                  .Select(g => new ScheduleDetailResponse
                                                  {
                                                     ScheduleDetailId = g.Id,
                                                     ScheduleId = g.ScheduleId,
                                                     StartTime = g.StartTime,
                                                     FinishTime = g.FinishTime,
                                                     TeacherSubjectId = g.TeacherSubjectId,
                                                     TeacherName = g.TeacherSubject != null && g.TeacherSubject.Teacher != null && g.TeacherSubject.Teacher.User != null 
                                                                   ? g.TeacherSubject.Teacher.User.FullName 
                                                                   : "Chưa phân công",
                                                     SubjectName = g.TeacherSubject != null && g.TeacherSubject.Subject != null 
                                                                   ? g.TeacherSubject.Subject.SubjectName 
                                                                   : "Môn học trống",
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
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var isExisted = await context.Schedule.AnyAsync(x => x.Id != schedule.Id
                    && x.Name == request.Name && x.SchoolYear == request.SchoolYear
                    && x.Term == request.Term && x.ClassYearId == request.ClassYearId);

                if (isExisted) return null;

                if (request.IsActive == true)
                {
                    var oldActive = await context.Schedule
                        .FirstOrDefaultAsync(x => x.Id != schedule.Id
                                               && x.ClassYearId == request.ClassYearId
                                               && x.SchoolYear == request.SchoolYear
                                               && x.Term == request.Term
                                               && x.IsActive == true);
                    if (oldActive != null)
                    {
                        oldActive.IsActive = false;
                    }
                }

                if (request.ClassYearId != schedule.ClassYearId)
                {
                    await context.ScheduleDetail
                                 .Where(x => x.ScheduleId == schedule.Id)
                                 .ExecuteDeleteAsync();
                }

                var className = await context.ClassYear
                                             .Where(x => x.Id == request.ClassYearId)
                                             .Select(x => x.ClassName)
                                             .FirstOrDefaultAsync();

                schedule.Name = request.Name;
                schedule.SchoolYear = (int)request.SchoolYear;
                schedule.Term = (int)request.Term;
                schedule.IsActive = (bool)request.IsActive;
                schedule.ClassYearId = request.ClassYearId;

                await context.SaveChangesAsync();
                await transaction.CommitAsync(); 

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
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
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

        public async Task<PagedResponse<ScheduleResponse>> GetAllScheduleForAdmin(ScheduleFilterRequest request)
        {
            var query = context.Schedule.AsQueryable();

            //filtering
            if (request.SchoolYear.HasValue)
                query = query.Where(x => x.SchoolYear == request.SchoolYear);
            if (request.Term.HasValue)
                query = query.Where(x => x.Term == request.Term);
            if (request.IsActive.HasValue)
                query = query.Where(x => x.IsActive == request.IsActive);

            //sorting
            if (!string.IsNullOrWhiteSpace(request.SortBy))
            {
                if (request.SortBy.Equals("Name", StringComparison.OrdinalIgnoreCase))
                {
                    query = request.IsAscending ? query.OrderBy(x => x.Name) : query.OrderByDescending(x => x.Name);
                }
                else if (request.SortBy.Equals("ClassName", StringComparison.OrdinalIgnoreCase))
                {
                    query = request.IsAscending ? query.OrderBy(x => x.ClassYear.ClassName) : query.OrderByDescending(x => x.ClassYear.ClassName);
                }
                else if (request.SortBy.Equals("SchoolYear", StringComparison.OrdinalIgnoreCase))
                {
                    query = request.IsAscending ? query.OrderBy(x => x.SchoolYear) : query.OrderByDescending(x => x.SchoolYear);
                }
            }

            var totalCount = await query.CountAsync();
            var skipResults = (request.PageNumber - 1) * request.PageSize;

            var scheduleList = await query
                                    .AsNoTracking()
                                    .Skip(skipResults)
                                    .Take(request.PageSize)
                                    .Select(x => new ScheduleResponse 
                                    {
                                        ScheduleId = x.Id,
                                        SchoolYear = x.SchoolYear,
                                        ClassName = x.ClassYear.ClassName,
                                        ClassYearId = x.ClassYearId,
                                        IsActive = x.IsActive,
                                        Name = x.Name,
                                        Term = x.Term
                                    }).ToListAsync();

            return new PagedResponse<ScheduleResponse>
            {
                PageSize = request.PageSize,
                Items = scheduleList,
                PageNumber = request.PageNumber,
                TotalCount = totalCount
            };
        }

        public async Task<List<ScheduleDetailResponse>> GetScheduleDetailByScheduleId(Guid scheduleId)
        {
            var isExisted = await context.Schedule.AnyAsync(x => x.Id == scheduleId);
            if (isExisted == false) return null; 
            var scheduleDetailList = await context.ScheduleDetail
                                                  .AsNoTracking()
                                                  .Where(x => x.ScheduleId == scheduleId)
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

            foreach (var item in scheduleDetailList)
            {
                item.DayOfWeekVietNamese = GetVietNameseDay(item.DayOfWeek);
            }

            return scheduleDetailList;
        }
    }
}
