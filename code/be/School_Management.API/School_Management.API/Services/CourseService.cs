using School_Management.API.Exceptions;
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
    }
}
