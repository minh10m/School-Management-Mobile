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
        public async Task<(bool result, string? message)> CreateResult(List<ResultRequest> requests)
        {
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

        public async Task<(ResultResponse? data, string? message)> UpdateResult(UpdateResultRequest request, Guid resultId, Guid userId)
        {
            var teacher = await context.Teacher.FirstOrDefaultAsync(x => x.UserId == userId);
            if (teacher == null) return (null, "NOT_FOUND_TEACHER");
            var result = await context.Result.Include(x => x.Student).ThenInclude(x => x.User)
                                             .Include(x => x.Subject).ThenInclude(x => x.TeacherSubjects)
                                             .FirstOrDefaultAsync(x => x.Id == resultId);
            if (result == null) return (null, "NOT_FOUND_RESULT");

            var isTeacher = result.Subject.TeacherSubjects.Any(x => x.TeacherId == teacher.Id);
            if (isTeacher == false) return (null, "IS_NOT_TEACHER_OF_SUBJECT");

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
