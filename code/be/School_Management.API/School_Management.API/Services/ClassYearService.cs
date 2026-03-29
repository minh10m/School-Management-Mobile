using School_Management.API.Exceptions;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class ClassYearService : IClassYearService
    {
        private readonly IClassYearRepository classYearRepository;

        public ClassYearService(IClassYearRepository classYearRepository)
        {
            this.classYearRepository = classYearRepository;
        }
        public async Task<ClassYearResponse> CreateClassYear(PostOrUpdateClassYearReq request)
        {
            var (result, errorCode) = await classYearRepository.CreateClassYear(request);
            return errorCode switch
            {
                "DUPLICATE_CLASSNAME" => throw new ConflictException("Tên lớp này đã có trong năm học"),
                "IS_HOMEROOM" => throw new ConflictException("Giáo viên này đã có lớp chủ nhiệm"),
                "TEACHER_NULL" => throw new NotFoundException("Giáo viên không tồn tại, không thể tạo lớp"),
                _ => result!
            };
        }

        public async Task<ClassYearResponse> UpdateClassYear(PostOrUpdateClassYearReq request, Guid classYearId)
        {
            throw new NotImplementedException();
        }
    }
}
