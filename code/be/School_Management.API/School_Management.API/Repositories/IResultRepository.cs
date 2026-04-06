using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IResultRepository
    {
        public Task<(bool result, string? message)> CreateResult(List<ResultRequest> requests, Guid userId);
        public Task<(ResultResponse? data, string? message)> UpdateResult(UpdateResultRequest request, Guid resultId, Guid userId);
        public Task<(List<ResultForStudentResponse>? data, string? message)> GetMyResultForStudent(ResultOfStudentRequest request, Guid userId);
        public Task<(List<StudentResultForTeacherResponse>? data, string? message)> GetResultOfAllStudentInClass(ResultOfStudentRequest request, Guid userId);

    }
}
