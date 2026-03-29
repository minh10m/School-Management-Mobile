using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class ClassYearRepository : IClassYearRepository
    {
        private readonly ApplicationDbContext context;

        public ClassYearRepository(ApplicationDbContext context)
        {
            this.context = context;
        }
        public async Task<(ClassYearResponse? data, string? errorCode)> CreateClassYear(PostOrUpdateClassYearReq request)
        {
            var isExistedClassName = await context.ClassYear.AnyAsync(x => x.ClassName.ToLower() == request.ClassName.ToLower() && x.SchoolYear == request.SchoolYear);
            if (isExistedClassName) return (null, "DUPLICATE_CLASSNAME");

            

            var teacherInfo = await context.Teacher
                                           .Where(x => x.Id == request.HomeRoomId)
                                           .Select(g => new
                                           {
                                               teacherName = g.User.FullName,
                                               isHomeRoom = context.ClassYear.Any(cy => cy.HomeRoomId == g.Id && cy.SchoolYear == request.SchoolYear)
                                           }).FirstOrDefaultAsync();

            if (teacherInfo == null) return (null, "TEACHER_NULL");
            if (teacherInfo.isHomeRoom) return (null, "IS_HOMEROOM");

            var classYear = new ClassYear
            {
                SchoolYear = request.SchoolYear,
                Id = Guid.NewGuid(),
                ClassName = request.ClassName,
                Grade = request.Grade,
                HomeRoomId = request.HomeRoomId
            };
            context.ClassYear.Add(classYear);
            await context.SaveChangesAsync();
            return (new ClassYearResponse
            {
                ClassYearId = classYear.Id,
                ClassName = classYear.ClassName,
                Grade = classYear.Grade,
                HomeRoomId = (Guid)classYear.HomeRoomId,
                SchoolYear = classYear.SchoolYear,
                HomeRoomName = teacherInfo.teacherName

            }, "SUCCESS");

        }
    }
}
