using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IClassYearRepository
    {
        public Task<(ClassYearResponse? data, string? errorCode)> CreateClassYear(PostOrUpdateClassYearReq request);
        public Task<(ClassYearResponse? data, string? errorCode)> UpdateClassYear(PostOrUpdateClassYearReq request, Guid classYearId);
        public Task<PagedResponse<ClassYearResponse>> GetAllClass(ClassYearFilterRequest request);
        public Task<(ClassYearResponse? data, string? errorCode)> GetClassYearById(Guid classYearId);
        public Task<(PagedResponse<ClassYearResponse>? data, string? errorCode)> GetAllClassOfTeaching(ClassOfTeacherFilterRequest request, Guid userId);

    }
}
