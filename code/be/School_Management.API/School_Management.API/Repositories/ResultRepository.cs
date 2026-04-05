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
    }
}
