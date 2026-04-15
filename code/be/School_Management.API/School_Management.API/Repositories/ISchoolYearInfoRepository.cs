using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface ISchoolYearInfoRepository
    {
        public Task<(SchoolYearInfoResponse? data, string message)> CreateSchoolYearInfo(SchoolYearInfoRequest request);
        public Task<(SchoolYearInfoResponse? data, string message)> UpdateSchoolYearInfo(SchoolYearInfoRequest request, Guid schoolYearInfoId);
        public Task<SchoolYearInfoResponse> GetSchoolYearInfo();
    }
}
