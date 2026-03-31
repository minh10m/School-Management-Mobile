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
                "CONFLICT_NAMEGRADE" => throw new BadRequestException("Khối và lớp không tương thich"),
                _ => result!
            };
        }

        public async Task<PagedResponse<ClassYearResponse>> GetAllClass(ClassYearFilterRequest request)
        {
            return await classYearRepository.GetAllClass(request);
        }

        public async Task<PagedResponse<ClassYearResponse>> GetMyClassIsTeachingForTeacher(ClassOfTeacherFilterRequest request, Guid userId)
        {
            var (result, errorCode) = await classYearRepository.GetMyClassIsTeachingForTeacher(request, userId);
            return errorCode switch
            {
                "NOT_FOUND_TEACHER" => throw new NotFoundException("Thông tin về lớp học của bạn không có"),
                _ => result!
            };
        }

        public async Task<ClassYearResponse> GetClassYearById(Guid classYearId)
        {
            var (result, errorCode) = await classYearRepository.GetClassYearById(classYearId);
            return errorCode switch
            {
                "NOT_FOUND_CLASS" => throw new NotFoundException("Lớp học không tồn tại"),
                _ => result!
            };
        }

        public async Task<ClassYearResponse> UpdateClassYear(PostOrUpdateClassYearReq request, Guid classYearId)
        {
            var (result, errorCode) = await classYearRepository.UpdateClassYear(request, classYearId);
            return errorCode switch
            {
                "DUPLICATE_CLASSNAME" => throw new ConflictException("Tên lớp này đã có trong năm học"),
                "IS_HOMEROOM" => throw new ConflictException("Giáo viên này đã có lớp chủ nhiệm"),
                "TEACHER_NULL" => throw new NotFoundException("Giáo viên không tồn tại, không thể tạo lớp"),
                "CONFLICT_NAMEGRADE" => throw new BadRequestException("Khối và lớp không tương thich"),
                "NOT_FOUND_CLASS" => throw new NotFoundException("Lớp học không tồn tại"),
                _ => result!
            };
        }

        public async Task<PagedResponse<ClassYearResponse>> GetAllClassIsTeachingByTeacher(ClassOfTeacherFilterRequest request, Guid teacherId)
        {
            var (result, errorCode) = await classYearRepository.GetAllClassIsTeachingByTeacher(request, teacherId);
            return errorCode switch
            {
                "NOT_FOUND_TEACHER" => throw new NotFoundException("Thông tin về lớp học của giáo viên này không có"),
                _ => result!
            };
        }

        public async Task<ClassYearResponse> GetMyHomeRoomClass(HomeRoomClassOfTeacherRequest request, Guid userId)
        {
            var (result, error) = await classYearRepository.GetMyHomeRoomClass(request, userId);
            return error switch
            {
                "NOT_FOUND_TEACHER" => throw new NotFoundException("Thông tin giáo viên không tồn tại, nên không có lớp"),
                "NOT_HAVE_HOMEROOM" => throw new NotFoundException("Không có thông tin lớp chủ nhiệm"),
                _ => result!
            };
        }

        public async Task<ClassYearResponse> GetMyClassForStudent(ClassOfStudentRequest request, Guid userId)
        {
            var (result, errorCode) = await classYearRepository.GetMyClassForStudent(request, userId);
            return errorCode switch
            {
                "NOT_FOUND_STUDENT" => throw new NotFoundException("Thông tin không tồn tại, không thể tìm thấy lớp"),
                "NOT_FOUND_CLASS" => throw new NotFoundException("Không tìm thấy lớp hiện tại của bạn"),
                _ => result!
            };
        }
    }
}
