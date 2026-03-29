using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IClassYearService
    {
        public Task<ClassYearResponse> CreateClassYear(PostOrUpdateClassYearReq request);
        public Task<ClassYearResponse> UpdateClassYear(PostOrUpdateClassYearReq request, Guid classYearId);
        public Task<PagedResponse<ClassYearResponse>> GetAllClass(ClassYearFilterRequest request);
    }
}
