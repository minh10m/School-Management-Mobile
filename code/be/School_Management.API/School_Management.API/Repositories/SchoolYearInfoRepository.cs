using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class SchoolYearInfoRepository : ISchoolYearInfoRepository
    {
        private readonly ApplicationDbContext context;

        public SchoolYearInfoRepository(ApplicationDbContext context)
        {
            this.context = context;
        }
        public async Task<(SchoolYearInfoResponse? data, string message)> CreateSchoolYearInfo(SchoolYearInfoRequest request)
        {
            var isOnlyOne = await context.SchoolYearInfo.CountAsync();
            if (isOnlyOne != 0) return (null, "ONLY_ONE_RECORD");
            var schoolYearInfo = new SchoolYearInfo
            {
                Id = Guid.NewGuid(),
                SchoolYear = request.SchoolYear,
                Term = request.Term
            };

            context.SchoolYearInfo.Add(schoolYearInfo);
            await context.SaveChangesAsync();

            var result = new SchoolYearInfoResponse
            {
                Id = schoolYearInfo.Id,
                SchoolYear = schoolYearInfo.SchoolYear,
                Term = schoolYearInfo.Term
            };

            return (result, "SUCCESS");
        }

        public async Task<SchoolYearInfoResponse> GetSchoolYearInfo()
        {
            var result = await context.SchoolYearInfo.FirstOrDefaultAsync();
            var resultResponse = new SchoolYearInfoResponse
            {
                Id = result.Id,
                SchoolYear = result.SchoolYear,
                Term = result.Term
            };

            return resultResponse;
        }

        public async Task<(SchoolYearInfoResponse? data, string message)> UpdateSchoolYearInfo(SchoolYearInfoRequest request, Guid schoolYearInfoId)
        {
            var schoolYearInfo = await context.SchoolYearInfo.FirstOrDefaultAsync(x => x.Id == schoolYearInfoId);
            if (schoolYearInfo == null) return (null, "NOT_FOUND_SCHOOLYEAR_INFO");

            schoolYearInfo.SchoolYear = request.SchoolYear;
            schoolYearInfo.Term = request.Term;

            await context.SaveChangesAsync();

            var result = new SchoolYearInfoResponse
            {
                Id = schoolYearInfo.Id,
                SchoolYear = schoolYearInfo.SchoolYear,
                Term = schoolYearInfo.Term
            };

            return (result, "SUCCESS");
        }
    }
}
