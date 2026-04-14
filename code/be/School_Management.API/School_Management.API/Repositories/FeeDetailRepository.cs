using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class FeeDetailRepository : IFeeDetailRepository
    {
        private readonly ApplicationDbContext context;

        public FeeDetailRepository(ApplicationDbContext context)
        {
            this.context = context;
        }
        public async Task<(FeeDetailResponse? data, string message)> CreateFeeDetailForStudent(FeeDetailRequest request)
        {
            var isExisted = await context.FeeDetail.AnyAsync(x => x.StudentId == request.StudentId && x.SchoolYear == request.SchoolYear
                                                               && x.Reason.Trim().ToLower() == request.Reason.Trim().ToLower());
            if (isExisted) return (null, "CONFLICT_REASON");

            var studentInfo = await context.Student.AsNoTracking().Where(x => x.Id == request.StudentId).Select(g => new { g.User.FullName, g.Id }).FirstOrDefaultAsync();
            if (studentInfo == null) return (null, "NOT_FOUND_STUDENT");

            var feeDetail = new FeeDetail
            {
                Id = Guid.NewGuid(),
                AmountDue = request.AmountDue,
                AmountPaid = 0,
                FeeId = null,
                PaidAt = null,
                Reason = request.Reason,
                SchoolYear = request.SchoolYear,
                Status = "Chưa đóng",
                StudentId = request.StudentId
            };

            context.FeeDetail.Add(feeDetail);
            await context.SaveChangesAsync();


            var result = new FeeDetailResponse
            {
                Id = feeDetail.Id,
                AmountDue = feeDetail.AmountDue,
                AmountPaid = feeDetail.AmountPaid,
                FeeId = feeDetail.FeeId,
                PaidAt = feeDetail.PaidAt,
                Reason = feeDetail.Reason,
                SchoolYear = feeDetail.SchoolYear,
                Status = feeDetail.Status,
                StudentId = feeDetail.StudentId,
                StudentName = studentInfo.FullName
            };
            return (result, "SUCCESS");
        }

        public async Task<(FeeDetailResponse? data, string message)> UpdateFeeDetailForStudent(UpdateFeeDetailRequest request, Guid feeDetailId)
        {
            var feeDetail = await context.FeeDetail.Include(x => x.Student.User)
                                           .FirstOrDefaultAsync(x => x.Id == feeDetailId);
            if (feeDetail == null) return (null, "NOT_FOUND_FEE_DETAIL");

            if (feeDetail.AmountPaid > 0 && feeDetail.AmountDue != request.AmountDue)
            {
                return (null, "CANNOT_UPDATE_AMOUNT_ALREADY_PAID");
            }

            var cleanReason = request.Reason.Trim();
            var isExisted = await context.FeeDetail.AnyAsync(x => x.Id != feeDetailId
                                                               && x.StudentId == feeDetail.StudentId
                                                               && x.SchoolYear == request.SchoolYear
                                                               && x.Reason.ToLower().Trim() == cleanReason.ToLower());
            if (isExisted) return (null, "CONFLICT_REASON");

            feeDetail.AmountDue = request.AmountDue;
            feeDetail.Reason = cleanReason;
            feeDetail.SchoolYear = request.SchoolYear;

            await context.SaveChangesAsync();

            var result = new FeeDetailResponse
            {
                Id = feeDetail.Id,
                AmountDue = feeDetail.AmountDue,
                AmountPaid = feeDetail.AmountPaid,
                FeeId = feeDetail.FeeId,
                PaidAt = feeDetail.PaidAt,
                Reason = feeDetail.Reason,
                SchoolYear = feeDetail.SchoolYear,
                Status = feeDetail.Status,
                StudentId = feeDetail.StudentId,
                StudentName = feeDetail.Student.User.FullName
            };

            return (result, "SUCCESS");
        }
    }
}
