using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IClassYearRepository
    {
        public Task<(ClassYearResponse? data, string? errorCode)> CreateClassYear(PostOrUpdateClassYearReq request);
        public Task<(ClassYearResponse? data, string? errorCode)> UpdateClassYear(PostOrUpdateClassYearReq request, Guid classYearId);
        public Task<PagedResponse<ClassYearResponse>> GetAllClass(ClassYearFilterRequest request);
        public Task<(ClassYearResponse? data, string? errorCode)> GetClassYearById(Guid classYearId);
        public Task<(PagedResponse<ClassYearResponse>? data, string? errorCode)> GetMyClassIsTeachingForTeacher(ClassOfTeacherFilterRequest request, Guid userId);
        public Task<(PagedResponse<ClassYearResponse>? data, string? errorCode)> GetAllClassIsTeachingByTeacher(ClassOfTeacherFilterRequest request, Guid teacherId);
        public Task<(ClassYearResponse? data, string? errorCode)> GetMyHomeRoomClass(HomeRoomClassOfTeacherRequest request, Guid userId);
        public Task<(ClassYearResponse? data, string? errorCode)> GetMyClassForStudent(ClassOfStudentRequest request, Guid userId);
        public Task<(bool result, string? errorCode)> PromoteClassYear(ClassPromoteRequest request);

    }
}
