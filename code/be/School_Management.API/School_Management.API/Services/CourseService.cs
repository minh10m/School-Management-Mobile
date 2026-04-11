using School_Management.API.Exceptions;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class CourseService : ICourseService
    {
        private readonly ICourseRepository courseRepository;

        public CourseService(ICourseRepository courseRepository)
        {
            this.courseRepository = courseRepository;
        }
        public async Task<CourseResponse> CreateCourse(CreateCourseRequest request, Guid userId)
        {
            var (result, message) = await courseRepository.CreateCourse(request, userId);
            return message switch
            {
                "NOT_FOUND_TEACHER" => throw new NotFoundException("Bạn không phải là giáo viên"),
                "NOT_FOUND_TEACHERSUBJECTID" => throw new NotFoundException("Bạn chưa được phân công dạy môn nào"),
                "DUPLICATED_COURSENAME" => throw new ConflictException("Tên khóa học bạn tạo đã tồn tại trong danh sách khóa học của bạn"),
                "UNCORRECT_PRICE" => throw new BadRequestException("Giá tiền không được bé hơn 0"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<CourseResponse> GetCourseById(Guid courseId)
        {
            var (result, message) = await courseRepository.GetCourseById(courseId);
            return message switch
            {
                "NOT_FOUND_COURSE" => throw new NotFoundException("Không tìm thấy khóa học"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };

        }

        public async Task<PagedResponse<CourseResponse>> GetMyCourseForTeacher(MyCourseFilterRequest request, Guid userId)
        {
            var (result, message) = await courseRepository.GetMyCourseForTeacher(request, userId);
            return message switch
            {
                "NOT_FOUND_TEACHER" => throw new NotFoundException("Bạn không phải là giáo viên"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<CourseResponse> UpdateCourse(CreateCourseRequest request, Guid courseId, Guid userId)
        {
            var (result, message) = await courseRepository.UpdateCourse(request, courseId, userId);
            return message switch
            {
                "NOT_FOUND_TEACHER" => throw new NotFoundException("Bạn không phải là giáo viên"),
                "NOT_FOUND_TEACHERSUBJECTID" => throw new NotFoundException("Bạn chưa được phân công dạy môn nào"),
                "DUPLICATED_COURSENAME" => throw new ConflictException("Tên khóa học bạn tạo đã tồn tại trong danh sách khóa học của bạn"),
                "UNCORRECT_PRICE" => throw new BadRequestException("Giá tiền không được bé hơn 0"),
                "NOT_FOUND_COURSE" => throw new NotFoundException("Không tìm thấy khóa học này"),
                "FORBIDDEN" => throw new ForbiddenException("Bạn không phải giáo viên tạo ra khóa học này"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }
    }
}
