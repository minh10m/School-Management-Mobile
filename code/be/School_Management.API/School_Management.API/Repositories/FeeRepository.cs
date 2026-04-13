using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class FeeRepository : IFeeRepository
    {
        private readonly ApplicationDbContext context;

        public FeeRepository(ApplicationDbContext context)
        {
            this.context = context;
        }
        public async Task<(FeeResponse? data, string message)> CreateFee(FeeRequest request)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                if (request.Amount < 0) return (null, "AMOUNT_IS_NEGATIVE");

                var classYear = await context.ClassYear.AsNoTracking()
                                                       .Where(x => x.Id == request.ClassYearId)
                                                       .Select(x => new { x.ClassName })
                                                       .FirstOrDefaultAsync();

                if (classYear == null) return (null, "NOT_FOUND_CLASS");

                var isTitleExisted = await context.Fee.AnyAsync(x => x.ClassYearId == request.ClassYearId && x.Title == request.Title);
                if (isTitleExisted) return (null, "CONFLICT_TITLE");

                var studentIds = await context.StudentClassYear.AsNoTracking().Where(x => x.ClassYearId == request.ClassYearId)
                                                               .Select(g => g.StudentId)
                                                               .ToListAsync();

                var fee = new Fee
                {
                    Id = Guid.NewGuid(),
                    DueDate = request.DueDate,
                    Amount = request.Amount,
                    ClassYearId = request.ClassYearId,
                    SchoolYear = request.SchoolYear,
                    Title = request.Title
                };

                var listFeeDetail = new List<FeeDetail>();

                foreach (var studentId in studentIds)
                {
                    var feeDetail = new FeeDetail
                    {
                        Id = Guid.NewGuid(),
                        AmountDue = request.Amount,
                        AmountPaid = 0,
                        FeeId = fee.Id,
                        PaidAt = null,
                        Reason = request.Title,
                        Status = "Chưa đóng",
                        StudentId = studentId
                    };
                    listFeeDetail.Add(feeDetail);
                }

                context.Fee.Add(fee);
                context.FeeDetail.AddRange(listFeeDetail);
                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                var result = new FeeResponse
                {
                    Id = fee.Id,
                    DueDate = fee.DueDate,
                    Amount = fee.Amount,
                    ClassYearId = fee.ClassYearId,
                    SchoolYear = fee.SchoolYear,
                    Title = fee.Title,
                    ClassName = classYear.ClassName ?? ""
                };
                return (result, "SUCCESS");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
