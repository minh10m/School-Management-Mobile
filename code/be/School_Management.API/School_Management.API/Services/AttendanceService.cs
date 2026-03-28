using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Exceptions;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly ApplicationDbContext context;
        private readonly ITeacherRepository teacherRepository;
        private readonly IAttendanceRepository attendanceRepository;

        public AttendanceService(ApplicationDbContext context, ITeacherRepository teacherRepository, IAttendanceRepository attendanceRepository)
        {
            this.context = context;
            this.teacherRepository = teacherRepository;
            this.attendanceRepository = attendanceRepository;
        }

        public async Task<int> InsertAttendance(AttendanceRequest request)
        {
            var studentMaps = await context.StudentClassYear
                                                   .AsNoTracking()
                                                   .Where(x => x.ClassYearId == request.ClassYearId)
                                                   .ToDictionaryAsync(x => x.StudentId, x => x.StudentClassYearId);
            var infoAttendances = new List<Attendance>();
            foreach (var item in request.InfoAttendances)
            {
                if(studentMaps.TryGetValue(item.StudentId, out var scy))
                {
                    infoAttendances.Add(new Attendance
                    {
                        Id = Guid.NewGuid(),
                        Status = item.Status,
                        Date = request.Date,
                        Note = item.Note,
                        StudentClassYearId = scy
                    });
                }
                
            }

            if (!infoAttendances.Any()) return 0;

            await context.Attendance.AddRangeAsync(infoAttendances);
            return await context.SaveChangesAsync();
        }
        public async Task<int> AttendanceCheck(AttendanceRequest request, Guid userId)
        {
            //Check HomeRoom teacher
            var isHomeroom = await CheckHomeRoomTeacher(request.ClassYearId, userId);
            if (!isHomeroom) throw new ForbiddenException("Bạn không phải giáo viên chủ nhiệm của lớp học");

            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var existed = await context.Attendance
                                           .AnyAsync(x => x.Date == request.Date && x.StudentClassYear.ClassYearId == request.ClassYearId);


                int result;
                if (existed == false)
                {
                    result = await InsertAttendance(request);

                }
                else
                {
                    var oldAttendances = await context.Attendance
                                                      .Where(x => x.StudentClassYear.ClassYearId == request.ClassYearId
                                                      && x.Date == request.Date)
                                                      .ToListAsync();

                    context.Attendance.RemoveRange(oldAttendances);
                    result = await InsertAttendance(request);
                }

                if (result == 0) throw new BadRequestException("Cập nhật thất bại");
                await transaction.CommitAsync();
                return result;
                

            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> CheckHomeRoomTeacher(Guid classYearId, Guid userId)
        {
            var teacherId = await teacherRepository.GetTeacherIdByUserId(userId);
            var homeRoomId = await context.ClassYear.Where(x => x.Id == classYearId)
                                                    .Select(g => g.HomeRoomId)
                                                    .FirstOrDefaultAsync();
            if (teacherId != homeRoomId) return false;
            return true;
        }

        public async Task<List<ClassAttendanceResponse>> GetClassAttendance(ClassAttendanceRequest request, Guid userId)
        {
            var isHomeroom = await CheckHomeRoomTeacher(request.ClassYearId, userId);
            if (!isHomeroom) throw new ForbiddenException("Bạn không phải giáo viên chủ nhiệm của lớp học");
            return await attendanceRepository.GetClassAttendance(request);
        }
    }
}
