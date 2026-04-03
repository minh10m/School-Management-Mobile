using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IClassYearService
    {
        public Task<ClassYearResponse> CreateClassYear(PostOrUpdateClassYearReq request);
        public Task<ClassYearResponse> UpdateClassYear(PostOrUpdateClassYearReq request, Guid classYearId);
        public Task<PagedResponse<ClassYearResponse>> GetAllClass(ClassYearFilterRequest request);
        public Task<ClassYearResponse> GetClassYearById(Guid classYearId);
        public Task<PagedResponse<ClassYearResponse>> GetMyClassIsTeachingForTeacher(ClassOfTeacherFilterRequest request, Guid userId);
        public Task<PagedResponse<ClassYearResponse>> GetAllClassIsTeachingByTeacher(ClassOfTeacherFilterRequest request, Guid teacherId);
        public Task<ClassYearResponse> GetMyHomeRoomClass(HomeRoomClassOfTeacherRequest request, Guid userId);
        public Task<ClassYearResponse> GetMyClassForStudent(ClassOfStudentRequest request, Guid userId);
        public Task<bool> PromoteClassYear(ClassPromoteRequest request);
    }
}
