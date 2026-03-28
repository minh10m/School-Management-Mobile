using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class AttendanceRepository : IAttendanceRepository
    {
        private readonly ApplicationDbContext context;

        public AttendanceRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public async Task<List<ClassAttendanceResponse>> GetClassAttendance(ClassAttendanceRequest request)
        {
            return await context.StudentClassYear
                                .AsNoTracking()
                                .Where(x => x.ClassYearId == request.ClassYearId)
                                .Select(g => new ClassAttendanceResponse
                                {
                                    StudentId = g.StudentId,
                                    StudentName = g.Student.User.FullName,
                                    AttendanceInfo = g.Attendances
                                                      .Where(x => x.Date == request.Date)
                                                      .Select(g => new AttendanceInfo
                                                      {
                                                          AttendanceId = g.Id,
                                                          Status = g.Status,
                                                          Note = g.Note
                                                      }).FirstOrDefault()
                                })
                                .OrderBy(x => x.StudentName)
                                .ToListAsync();
        }

        public async Task<StudentAttendanceResponse> GetStudentAttendance(StudentAttedanceRequest request, Guid studentId)
        {
            var details = await context.Attendance
                                .AsNoTracking()
                                .Where(x => x.StudentClassYear.StudentId == studentId
                                && x.Date.Month == request.Month && x.Date.Year == request.Year)
                                .Select(g => new StudentAttendanceInfo
                                {
                                    Date = g.Date,
                                    Note = g.Note,
                                    Status = g.Status
                                })
                                .OrderBy(g => g.Date.Day)
                                .ToListAsync();

            var total = details.Count;
            var present = details.Count(x => x.Status == "Có mặt" || x.Status == "Đi trễ");
            var absent = details.Count(x => x.Status == "Vắng mặt");
            var percentage = (total > 0) ? ((double)present / total) * 100 : 0;

            return new StudentAttendanceResponse
            {
                Percentage = Math.Round(percentage, 1),
                TotalPresent = present,
                TotalAbsent = absent,
                StudentAttendances = details 
            };
        }
    }
}
