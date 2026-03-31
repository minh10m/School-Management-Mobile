using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using System.Linq;

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
            var isExistedClassName = await context.ClassYear.AnyAsync(x => x.ClassName.ToLower() == request.ClassName!.ToLower() && x.SchoolYear == request.SchoolYear);
            if (isExistedClassName) return (null, "DUPLICATE_CLASSNAME");

            var gradeValue = new string(request.ClassName!.TakeWhile(char.IsDigit).ToArray());
            if (string.IsNullOrWhiteSpace(gradeValue) || (int.Parse(gradeValue) != request.Grade))
                return (null, "CONFLICT_NAMEGRADE");

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

        public async Task<PagedResponse<ClassYearResponse>> GetAllClass(ClassYearFilterRequest request)
        {
            var query = context.ClassYear.AsNoTracking()
                                         .Include(x => x.Teacher)
                                         .ThenInclude(t => t.User)
                                         .AsQueryable();


            //Filtering
            if (!string.IsNullOrWhiteSpace(request.ClassName))
            {
                var name = request.ClassName.Trim();
                query = query.Where(x => x.ClassName.ToLower().Contains(name));
            }
            if (request.SchoolYear.HasValue)
                query = query.Where(x => x.SchoolYear == request.SchoolYear);
            if (request.Grade.HasValue)
                query = query.Where(x => x.Grade == request.Grade);

            //Sorting
            if(!string.IsNullOrWhiteSpace(request.SortBy))
            {
                if(request.SortBy.Equals("ClassName", StringComparison.OrdinalIgnoreCase))
                {
                    query = request.IsAscending ? query.OrderBy(x => x.ClassName) : query.OrderByDescending(x => x.ClassName);
                }
                else if (request.SortBy.Equals("SchoolYear", StringComparison.OrdinalIgnoreCase))
                {
                    query = request.IsAscending ? query.OrderBy(x => x.SchoolYear) : query.OrderByDescending(x => x.SchoolYear);
                }
                else if (request.SortBy.Equals("Grade", StringComparison.OrdinalIgnoreCase))
                {
                    query = request.IsAscending ? query.OrderBy(x => x.Grade) : query.OrderByDescending(x => x.Grade);
                }
            }
            var totalCount = await query.CountAsync();
            var skipResults = (request.PageNumber - 1) * request.PageSize;
            var listClassYear = await query.Skip(skipResults)
                                           .Take(request.PageSize)
                                           .Select(x => new ClassYearResponse
                                           {
                                               ClassName = x.ClassName,
                                               ClassYearId = x.Id,
                                               Grade = x.Grade,
                                               HomeRoomId = (Guid)x.HomeRoomId,
                                               SchoolYear = x.SchoolYear,
                                               HomeRoomName = x.Teacher.User.FullName

                                           }).ToListAsync();

            return new PagedResponse<ClassYearResponse>
            {
                Items = listClassYear,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalCount = totalCount
            };
        }

        public async Task<(PagedResponse<ClassYearResponse>? data, string? errorCode)> GetMyClassIsTeachingForTeacher(ClassOfTeacherFilterRequest request, Guid userId)
        {
            var teacherId = await context.Teacher.Where(x => x.UserId == userId)
                                                 .Select(g => g.Id)
                                                 .FirstOrDefaultAsync();

            if (teacherId == Guid.Empty) return (null, "NOT_FOUND_TEACHER");

            var classQueryId = context.ScheduleDetail.AsNoTracking()
                                              .Where(x => x.TeacherSubject.TeacherId == teacherId
                                                     && x.Schedule.SchoolYear == request.SchoolYear)
                                              .Select(g => g.Schedule.ClassYearId)
                                              .Distinct();

            var query = context.ClassYear.Where(x => classQueryId.Contains(x.Id));

            //Filtering
            if(!string.IsNullOrWhiteSpace(request.ClassName))
            {
                var className = request.ClassName.Trim();
                query = query.Where(x => x.ClassName.ToLower().Contains(className));
            }
            if (request.Grade.HasValue)
                query = query.Where(x => x.Grade == request.Grade);

            //Sorting
            if(!string.IsNullOrWhiteSpace(request.SortBy))
            {
                if(request.SortBy.Equals("ClassName"))
                {
                    query = request.IsAscending ? query.OrderBy(x => x.ClassName) : query.OrderByDescending(x => x.ClassName);
                }
            }

            var totalCount = await query.CountAsync();
            var skipResults = (request.PageNumber - 1) * request.PageSize;
            var classList = await query
                .Skip(skipResults)
                .Take(request.PageSize)
                .Select(x => new ClassYearResponse
            {
                SchoolYear = x.SchoolYear,
                ClassName = x.ClassName,
                ClassYearId = x.Id,
                Grade = x.Grade,
                HomeRoomId = (Guid)x.HomeRoomId!,
                HomeRoomName = null
            })
             .ToListAsync();

            return (new PagedResponse<ClassYearResponse>
            {
                Items = classList,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalCount = totalCount
            }, "SUCCESS");
        }

        public async Task<(ClassYearResponse? data, string? errorCode)> GetClassYearById(Guid classYearId)
        {
            var classYear = await context.ClassYear
                .AsNoTracking()
                .Include(x => x.Teacher)
                .ThenInclude(t => t.User)
                .Where(x => x.Id == classYearId).FirstOrDefaultAsync();
            if (classYear == null) return (null, "NOT_FOUND_CLASS");

            return ( new ClassYearResponse
            {
                SchoolYear = classYear.SchoolYear,
                ClassName = classYear.ClassName,
                ClassYearId = classYear.Id,
                Grade = classYear.Grade,
                HomeRoomId = (Guid)classYear.HomeRoomId,
                HomeRoomName = classYear.Teacher.User.FullName
            }, "SUCCESS");
        }

        public async Task<(ClassYearResponse? data, string? errorCode)> UpdateClassYear(PostOrUpdateClassYearReq request, Guid classYearId)
        {
            var classYear = await context.ClassYear.Where(x => x.Id == classYearId)
                                                   .FirstOrDefaultAsync();
            if (classYear == null) return (null, "NOT_FOUND_CLASS");

            var isExistedClassName = await context.ClassYear.AnyAsync(x => x.ClassName.ToLower() == request.ClassName!.ToLower() && x.SchoolYear == request.SchoolYear && x.Id != classYearId);
            if (isExistedClassName) return (null, "DUPLICATE_CLASSNAME");

            var gradeValue = new string(request.ClassName!.TakeWhile(char.IsDigit).ToArray());
            if (string.IsNullOrWhiteSpace(gradeValue) || (int.Parse(gradeValue) != request.Grade))
                return (null, "CONFLICT_NAMEGRADE");

            var teacherInfo = await context.Teacher
                                           .Where(x => x.Id == request.HomeRoomId)
                                           .Select(g => new
                                           {
                                               teacherName = g.User.FullName,
                                               isHomeRoom = context.ClassYear.Any(cy => cy.HomeRoomId == g.Id && cy.Id != classYearId && cy.SchoolYear == request.SchoolYear)
                                           }).FirstOrDefaultAsync();

            if (teacherInfo == null) return (null, "TEACHER_NULL");
            if (teacherInfo.isHomeRoom) return (null, "IS_HOMEROOM");

            classYear.Grade = request.Grade;
            classYear.ClassName = request.ClassName;
            classYear.HomeRoomId = request.HomeRoomId;
            classYear.SchoolYear = request.SchoolYear;

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

        public async Task<(PagedResponse<ClassYearResponse>? data, string? errorCode)> GetAllClassIsTeachingByTeacher(ClassOfTeacherFilterRequest request, Guid teacherId)
        {
            var teacher = await context.Teacher.Where(x => x.Id == teacherId)
                                                 .FirstOrDefaultAsync();

            if (teacher == null) return (null, "NOT_FOUND_TEACHER");

            var classQueryId = context.ScheduleDetail.AsNoTracking()
                                              .Where(x => x.TeacherSubject.TeacherId == teacherId
                                                     && x.Schedule.SchoolYear == request.SchoolYear)
                                              .Select(g => g.Schedule.ClassYearId)
                                              .Distinct();

            var query = context.ClassYear.Where(x => classQueryId.Contains(x.Id));

            //Filtering
            if (!string.IsNullOrWhiteSpace(request.ClassName))
            {
                var className = request.ClassName.Trim();
                query = query.Where(x => x.ClassName.ToLower().Contains(className));
            }
            if (request.Grade.HasValue)
                query = query.Where(x => x.Grade == request.Grade);

            //Sorting
            if (!string.IsNullOrWhiteSpace(request.SortBy))
            {
                if (request.SortBy.Equals("ClassName"))
                {
                    query = request.IsAscending ? query.OrderBy(x => x.ClassName) : query.OrderByDescending(x => x.ClassName);
                }
            }

            var totalCount = await query.CountAsync();
            var skipResults = (request.PageNumber - 1) * request.PageSize;
            var classList = await query
                .Skip(skipResults)
                .Take(request.PageSize)
                .Select(x => new ClassYearResponse
                {
                    SchoolYear = x.SchoolYear,
                    ClassName = x.ClassName,
                    ClassYearId = x.Id,
                    Grade = x.Grade,
                    HomeRoomId = (Guid)x.HomeRoomId!,
                    HomeRoomName = null
                })
             .ToListAsync();

            return (new PagedResponse<ClassYearResponse>
            {
                Items = classList,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalCount = totalCount
            }, "SUCCESS");
        }

        public async Task<(ClassYearResponse? data, string? errorCode)> GetMyHomeRoomClass(HomeRoomClassOfTeacherRequest request, Guid userId)
        {
            Guid? teacherId = await context.Teacher.AsNoTracking()
                                                 .Where(x => x.UserId == userId)
                                                 .Select(g => g.Id)
                                                 .FirstOrDefaultAsync();

            if (teacherId == null) return (null, "NOT_FOUND_TEACHER");

            var homeRoomClass = await context.ClassYear.AsNoTracking()
                                                       .Where(x => x.HomeRoomId == teacherId && x.SchoolYear == request.SchoolYear)
                                                       .Select(g => new ClassYearResponse
                                                       {
                                                           SchoolYear = g.SchoolYear,
                                                           ClassName = g.ClassName,
                                                           ClassYearId = g.Id,
                                                           Grade = g.Grade,
                                                           HomeRoomId = (Guid)g.HomeRoomId!,
                                                           HomeRoomName = null

                                                       }).FirstOrDefaultAsync();
            if (homeRoomClass == null) return (null, "NOT_HAVE_HOMEROOM");
            return (homeRoomClass, "SUCCESS");
        }

        public async Task<(ClassYearResponse? data, string? errorCode)> GetMyClassForStudent(ClassOfStudentRequest request, Guid userId)
        {
            Guid? studentId = await context.Student.AsNoTracking()
                                                   .Where(x => x.UserId == userId)
                                                   .Select(g => g.Id)
                                                   .FirstOrDefaultAsync();
            if (studentId == null) return (null, "NOT_FOUND_STUDENT");

            var myClass = await context.ClassYear.AsNoTracking()
                                                 .Where(x => x.SchoolYear == request.SchoolYear
                                                        && x.StudentClassYears.Any(scy => scy.StudentId == studentId))
                                                 .Select(g => new ClassYearResponse
                                                 {
                                                     SchoolYear = g.SchoolYear,
                                                     ClassName = g.ClassName,
                                                     ClassYearId = g.Id,
                                                     Grade = g.Grade,
                                                     HomeRoomId = (Guid)g.HomeRoomId,
                                                     HomeRoomName = g.Teacher.User.FullName
                                                 }).FirstOrDefaultAsync();
            if (myClass == null) return (null, "NOT_FOUND_CLASS");
            return (myClass, "SUCCESS");
        }
    }
}
