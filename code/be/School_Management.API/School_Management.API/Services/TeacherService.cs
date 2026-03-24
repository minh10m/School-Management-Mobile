using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class TeacherService : ITeacherService
    {
        private readonly ITeacherRepository teacherRepository;

        public TeacherService(ITeacherRepository teacherRepository)
        {
            this.teacherRepository = teacherRepository;
        }
        public async Task<PagedResponse<TeacherListResponse>> GetAllTeacher(string? filterOn, string? filterQuery, string? sortBy, bool isAscending, int pageNumber, int pageSize)
        {
            return await teacherRepository.GetAllTeacher(filterOn, filterQuery, sortBy, isAscending, pageNumber, pageSize);
        }

        public Task<TeacherInfoResponse> GetMyProfileForTeacher(Guid userId)
        {
            throw new NotImplementedException();
        }

        public Task<TeacherInfoResponse> GetTeacherById(Guid teacherId)
        {
            throw new NotImplementedException();
        }
    }
}
