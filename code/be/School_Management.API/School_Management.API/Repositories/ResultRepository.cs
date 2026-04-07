using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class ResultRepository : IResultRepository
    {
        private readonly ApplicationDbContext context;

        public ResultRepository(ApplicationDbContext context)
        {
            this.context = context;
        }
        public async Task<(bool result, string? message)> CreateResult(List<ResultRequest> requests, Guid userId)
        {
            var teacherId = await context.Teacher.AsNoTracking().Where(x => x.UserId == userId).Select(g => g.Id).FirstOrDefaultAsync();
            if (teacherId == Guid.Empty) return (false, "NOT_FOUND_TEACHER");

            var studentId = Guid.Empty;
            if (requests == null || !requests.Any()) return (false, "EMPTY_REQUEST");

            studentId = requests[0].StudentId;

            var classYearId = await context.StudentClassYear.AsNoTracking()
                                                            .Where(x => x.StudentId == studentId && x.ClassYear.SchoolYear == requests[0].SchoolYear)
                                                            .Select(g => g.ClassYearId)
                                                            .FirstOrDefaultAsync();

            if (classYearId == Guid.Empty) return (false, "NOT_FOUND_CLASSYEAR");

            var subjectIdsOfTeacher = await context.ScheduleDetail.AsNoTracking()
                                                         .Where(x => x.Schedule.ClassYearId == classYearId 
                                                                   && x.Schedule.IsActive == true
                                                                   && x.Schedule.SchoolYear == requests[0].SchoolYear && x.Schedule.Term == requests[0].Term
                                                                   && x.TeacherSubject.TeacherId == teacherId)
                                                         .Select(g => g.TeacherSubject.SubjectId)
                                                         .Distinct()
                                                         .ToListAsync();

            var isAllowed = requests.All(x => subjectIdsOfTeacher.Contains(x.SubjectId));
            if (!isAllowed) return (false, "FORBIDDEN_CREATE_RESULT");



            var isDuplicated = requests.GroupBy(x => new { x.Type, x.StudentId, x.SubjectId, x.SchoolYear, x.Term })
                                       .Any(g => g.Count() > 1);
            if (isDuplicated) return (false, "DUPLICATED_TYPE");

            var studentIds = requests.Select(x => x.StudentId).Distinct().ToList();
            var subjectIds = requests.Select(x => x.SubjectId).Distinct().ToList();
            var term = requests.Select(x => x.Term).FirstOrDefault();
            var schoolYear = requests.Select(x => x.SchoolYear).FirstOrDefault();

            var isExistingList = await context.Result.Where(x => studentIds.Contains(x.StudentId) && subjectIds.Contains(x.SubjectId) && x.Term == term && x.SchoolYear == schoolYear)
                                                     .Select(g => new { g.StudentId, g.SubjectId, g.Term, g.SchoolYear, g.Type } )
                                                     .ToListAsync();

            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var listResult = new List<Result>();
                foreach(var item in requests)
                {
                    var isExisted = isExistingList.Any(x =>
                                    x.StudentId == item.StudentId &&
                                    x.SubjectId == item.SubjectId &&
                                    x.Term == item.Term &&
                                    x.SchoolYear == item.SchoolYear &&
                                    x.Type.ToLower() == item.Type.ToLower());
                    if (isExisted) return (false, "CONFLICT_TYPE");
                    var result = new Result
                    {
                        Id = Guid.NewGuid(),
                        StudentId = item.StudentId,
                        SchoolYear = item.SchoolYear,
                        SubjectId = item.SubjectId,
                        Term = item.Term,
                        Type = item.Type,
                        Value = item.Value,
                        Weight = item.Weight
                    };
                    listResult.Add(result);
                }
                context.Result.AddRange(listResult);
                await context.SaveChangesAsync();
                await transaction.CommitAsync();
                return (true, "SUCCESS");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<(List<ResultForStudentResponse>? data, string? message)> GetMyResultForStudent(ResultOfStudentRequest request, Guid userId)
        {
            var studentId = await context.Student.AsNoTracking()
                                                 .Where(x => x.UserId == userId)
                                                 .Select(g => g.Id)
                                                 .FirstOrDefaultAsync();
            if (studentId == Guid.Empty) return (null, "NOT_FOUND_STUDENT");
            var myResultsList = await context.Result.Include(x => x.Subject).AsNoTracking()
                                               .Where(x => x.SchoolYear == request.SchoolYear
                                                        && x.Term == request.Term
                                                        && x.StudentId == studentId)
                                               .ToListAsync();
            var result = myResultsList.GroupBy(x => new { x.SubjectId, x.Subject.SubjectName })
                                      .Select(g => new ResultForStudentResponse
                                      {
                                          SubjectId = g.Key.SubjectId,
                                          SubjectName = g.Key.SubjectName,
                                          Average = g.Sum(x => x.Weight) > 0 ? (float)Math.Round(g.Sum(x => x.Value * x.Weight) / g.Sum(x => x.Weight), 2) : 0,
                                          DetailResults = g.Select(x => new DetailResult
                                          {
                                              Type = x.Type,
                                              Value = x.Value,
                                              Weight = x.Weight
                                          }).ToList()
                                      }).ToList();

            return (result, "SUCCESS");
        }

        public async Task<(List<StudentResultForTeacherResponse>? data, string? message)> GetResultOfAllStudentInClass(ResultOfAllStudentRequest request, Guid classYearId, Guid userId)
        {
            var teacherId = await context.Teacher.AsNoTracking()
                                                 .Where(x => x.UserId == userId)
                                                 .Select(g => g.Id)
                                                 .FirstOrDefaultAsync();
            if (teacherId == Guid.Empty) return (null, "NOT_FOUND_TEACHER");

            var classYearInfo = await context.ClassYear.AsNoTracking()
                .Where(x => x.Id == classYearId)
                .Select(x => new { x.HomeRoomId, x.SchoolYear })
                .FirstOrDefaultAsync(); if (classYearInfo == null) return (null, "NOT_FOUND_CLASS");

            if (classYearInfo.HomeRoomId != teacherId) return (null, "NOT_HOMEROOM_TEACHER");

            var studentIds = await context.StudentClassYear.AsNoTracking().Where(x => x.ClassYearId == classYearId)
                                                           .Select(g => g.StudentId)
                                                           .ToListAsync();

            if (!studentIds.Any()) return (null, "EMPTY_LIST");

            var listResults = await context.Result.Include(x => x.Subject)
                                                  .Include(x => x.Student).ThenInclude(x => x.User)
                                                  .Where(x => studentIds.Contains(x.StudentId)
                                                        && x.Term == request.Term && x.SchoolYear == classYearInfo.SchoolYear)
                                                  .ToListAsync();

            var overallResult = listResults.GroupBy(x => new { x.StudentId, x.Student.User.FullName })
                                           .Select(g => new StudentResultForTeacherResponse
                                           {
                                               StudentId = g.Key.StudentId,
                                               StudentName = g.Key.FullName,
                                               SubjectResults = g.GroupBy(t => new { t.SubjectId, t.Subject.SubjectName })
                                                                 .Select(h => new SubjectResult
                                                                 {
                                                                     SubjectId = h.Key.SubjectId,
                                                                     SubjectName = h.Key.SubjectName,
                                                                     Average = h.Sum(y => y.Weight) > 0 ? (float)Math.Round(h.Sum(y => y.Value * y.Weight) / h.Sum(y => y.Weight), 2) : 0
                                                                 }).ToList()
                                           }).ToList();
            return (overallResult, "SUCCESS");
        }

        public async Task<(ResultResponse? data, string? message)> UpdateResult(UpdateResultRequest request, Guid resultId, Guid userId)
        {
            var teacher = await context.Teacher.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId);
            if (teacher == null) return (null, "NOT_FOUND_TEACHER");
            var result = await context.Result.AsNoTracking().Include(x => x.Student).ThenInclude(x => x.User)
                                             .Include(x => x.Subject).ThenInclude(x => x.TeacherSubjects)
                                             .FirstOrDefaultAsync(x => x.Id == resultId);
            if (result == null) return (null, "NOT_FOUND_RESULT");

            var classYearId = await context.StudentClassYear.AsNoTracking()
                                                            .Where(x => x.StudentId == result.StudentId && x.ClassYear.SchoolYear == result.SchoolYear)
                                                            .Select(g => g.ClassYearId)
                                                            .FirstOrDefaultAsync();
            if (classYearId == Guid.Empty) return (null, "NOT_FOUND_CLASSYEAR");

            var subjectIdsOfTeacher = await context.ScheduleDetail.AsNoTracking()
                                                         .Where(x => x.Schedule.ClassYearId == classYearId
                                                                   && x.Schedule.IsActive == true
                                                                   && x.Schedule.SchoolYear == result.SchoolYear && x.Schedule.Term == result.Term
                                                                   && x.TeacherSubject.TeacherId == teacher.Id)
                                                         .Select(g => g.TeacherSubject.SubjectId)
                                                         .Distinct()
                                                         .ToListAsync();

            var isAllowed = subjectIdsOfTeacher.Contains(result.SubjectId);
            if (!isAllowed) return (null, "FORBIDDEN_UPDATE_RESULT");


            var isExisted = await context.Result.AnyAsync(x => x.SchoolYear == request.SchoolYear && x.Term == request.Term
                                                            && x.StudentId == result.StudentId && x.SubjectId == result.SubjectId
                                                            && x.Id != resultId && x.Type.ToLower() == request.Type.ToLower());
            if(isExisted) return (null, "DUPLICATED_TYPE");

            

            result.Type = request.Type;
            result.Term = request.Term;
            result.SchoolYear = request.SchoolYear;
            result.Value = request.Value;
            result.Weight = request.Weight;

            await context.SaveChangesAsync();
            return (new ResultResponse
            {
                Term = result.Term,
                SchoolYear = result.SchoolYear,
                StudentId = result.StudentId,
                StudentName = result.Student.User.FullName,
                SubjectId = result.SubjectId,
                SubjectName = result.Subject.SubjectName,
                ResultId = result.Id,
                Type = result.Type,
                Value = result.Value,
                Weight = result.Weight
            }, "SUCCESS");
        }
    }
}
