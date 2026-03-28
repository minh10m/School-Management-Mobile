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
    }
}
