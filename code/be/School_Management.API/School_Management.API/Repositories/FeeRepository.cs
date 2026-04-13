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
                    DueDate = request.DueDate.ToUniversalTime(),
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

        public async Task<PagedResponse<FeeResponse>> GetAllFee(FeeFilterRequest request)
        {
            var query = context.Fee.AsNoTracking().AsQueryable();
            query = query.Where(x => x.SchoolYear == request.SchoolYear);
            query = query.OrderBy(x => x.Title);

            var totalCount = await query.CountAsync();
            var skipsResult = (request.PageNumber - 1) * request.PageSize;

            var listResult = await query.Skip(skipsResult).Take(request.PageSize)
                                        .Select(fee => new FeeResponse
                                        {
                                            Id = fee.Id,
                                            DueDate = fee.DueDate,
                                            Amount = fee.Amount,
                                            ClassYearId = fee.ClassYearId,
                                            SchoolYear = fee.SchoolYear,
                                            Title = fee.Title,
                                            ClassName = fee.ClassYear.ClassName ?? ""
                                        }).ToListAsync();

            return new PagedResponse<FeeResponse>
            {
                Items = listResult,
                PageSize = request.PageSize,
                PageNumber = request.PageNumber,
                TotalCount = totalCount
            };
        }

        public async Task<PagedResponse<FeeDetailResponse>> GetAllFeeDetailOfFee(FeeDetailFilterRequest request)
        {
            var query = context.FeeDetail.AsNoTracking().Where(x => x.FeeId == request.FeeId);

            if(!string.IsNullOrWhiteSpace(request.StudentName))
            {
                var name = request.StudentName.Trim().ToLower();
                query = query.Where(x => x.Student.User.FullName.Trim().ToLower().Contains(name));
            }

            query = query.OrderBy(x => x.Id);
            var totalCount = await query.CountAsync();
            var skipsResult = (request.PageNumber - 1) * request.PageSize;
            var listResult = await query.Skip(skipsResult).Take(request.PageSize)
                                        .Select(g => new FeeDetailResponse
                                        {
                                            Id = g.Id,
                                            AmountDue = g.AmountDue,
                                            AmountPaid = g.AmountPaid,
                                            FeeId = g.FeeId,
                                            PaidAt = g.PaidAt,
                                            Reason = g.Reason,
                                            Status = g.Status,
                                            StudentId = g.StudentId,
                                            StudentName = g.Student.User.FullName
                                        }).ToListAsync();

            return new PagedResponse<FeeDetailResponse>
            {
                Items = listResult,
                PageSize = request.PageSize,
                PageNumber = request.PageNumber,
                TotalCount = totalCount
            };
        }

        public async Task<(FeeResponse? data, string message)> UpdateFee(UpdateFeeRequest request, Guid feeId)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var fee = await context.Fee.Include(x => x.ClassYear).FirstOrDefaultAsync(x => x.Id == feeId);
                if (fee == null) return (null, "NOT_FOUND_FEE");

                var isExisting = await context.Fee.AnyAsync(x => x.Id != feeId && x.ClassYearId == fee.ClassYearId && x.Title.Trim().ToLower() == request.Title.Trim().ToLower());
                if (isExisting) return (null, "CONFLICT_TITLE");

                if (request.Title != fee.Title)
                    await context.FeeDetail.Where(x => x.FeeId == fee.Id)
                                           .ExecuteUpdateAsync(g => g.SetProperty(l => l.Reason, l => request.Title));

                fee.Title = request.Title;
                fee.DueDate = request.DueDate.ToUniversalTime();

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
                    ClassName = fee.ClassYear.ClassName ?? ""
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
