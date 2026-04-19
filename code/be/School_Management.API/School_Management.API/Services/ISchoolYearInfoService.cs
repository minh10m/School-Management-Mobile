using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface ISchoolYearInfoService
    {
        public Task<SchoolYearInfoResponse> CreateSchoolYearInfo(SchoolYearInfoRequest request);
        public Task<SchoolYearInfoResponse> UpdateSchoolYearInfo(SchoolYearInfoRequest request, Guid schoolYearInfoId);
        public Task<SchoolYearInfoResponse?> GetSchoolYearInfo();
    }
}
