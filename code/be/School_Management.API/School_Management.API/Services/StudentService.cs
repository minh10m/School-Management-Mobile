using School_Management.API.Data;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class StudentService : IStudentService
    {
        private readonly ApplicationDbContext context;
        private readonly IStudentRepository studentRepository;

        public StudentService(ApplicationDbContext context, IStudentRepository studentRepository)
        {
            this.context = context;
            this.studentRepository = studentRepository;
        }

        public async Task<PagedResponse<StudentListResponse>> GetAllStudent(string? filterOn, string? filterQuery, string? sortBy, bool? isAscending, int pageNumber, int pageSize)
        {
            return await studentRepository.GetAllStudent(filterOn, filterQuery, sortBy, isAscending, pageNumber, pageSize);
        }
    }
}
