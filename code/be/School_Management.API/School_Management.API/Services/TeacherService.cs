using School_Management.API.Exceptions;
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

        public async Task<TeacherInfoResponse> GetMyProfileForTeacher(Guid userId)
        {
            var result = await teacherRepository.GetMyProfileForTeacher(userId);
            if (result == null) throw new NotFoundException("Teacher is invalid");
            return result;
        }

        public async Task<TeacherInfoResponse> GetTeacherById(Guid teacherId)
        {
            var result = await teacherRepository.GetTeacherById(teacherId);
            if (result == null) throw new NotFoundException("Teacher is invalid");
            return result;
        }
    }
}
