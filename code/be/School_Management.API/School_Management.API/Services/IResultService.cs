using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IResultService
    {
        public Task<bool> CreateResult(List<ResultRequest> requests, Guid userId);
        public Task<ResultResponse> UpdateResult(UpdateResultRequest request, Guid resultId, Guid userId);
        public Task<List<ResultForStudentResponse>> GetMyResultForStudent(ResultOfStudentRequest request, Guid userId);
        public Task<List<StudentResultForTeacherResponse>> GetResultOfAllStudentInClass(ResultOfAllStudentRequest request, Guid classYearId, Guid userId);
        public Task<List<ResultForStudentResponse>> GetResultOfOneStudentForTeacher(ResultOfAllStudentRequest request, Guid classYearId, Guid studentId, Guid userId);
    }
}
