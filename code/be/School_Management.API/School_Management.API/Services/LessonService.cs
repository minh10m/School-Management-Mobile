using School_Management.API.Exceptions;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class LessonService : ILessonService
    {
        private readonly ILessonRepository lessonRepository;

        public LessonService(ILessonRepository lessonRepository)
        {
            this.lessonRepository = lessonRepository;
        }
        public async Task<LessonResponse> CreateLesson(LessonRequest request)
        {
            var (result, message) = await lessonRepository.CreateLesson(request);
            return message switch
            {
                "NOT_FOUND_COURSE" => throw new NotFoundException("Không tìm thấy khóa học"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<PagedResponse<LessonResponse>> GetAllLessonOfCourse(LessonFilterRequest request)
        {
            var (result, message) = await lessonRepository.GetAllLessonOfCourse(request);
            return message switch
            {
                "NOT_FOUND_COURSE" => throw new NotFoundException("Không tìm thấy khóa học"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<LessonResponse> GetLessonById(Guid lessonId)
        {
            var (result, message) = await lessonRepository.GetLessonById(lessonId);
            return message switch
            {
                "NOT_FOUND_LESSON" => throw new NotFoundException("Bài học không tồn tại"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<bool> HardDeleteLesson(Guid lessonId, Guid userId)
        {
            var (result, message) = await lessonRepository.HardDeleteLesson(lessonId, userId);
            return message switch
            {
                "NOT_FOUND_TEACHER" => throw new NotFoundException("Bạn không là giáo viên"),
                "NOT_FOUND_LESSON" => throw new NotFoundException("Không tìm thấy bài học để xóa"),
                "NOT_IS_TEACHER_OF_COURSE" => throw new ForbiddenException("Bạn không phải là giáo viên của khóa học này"),
                "SUCCESS" => true,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<LessonResponse> UpdateLesson(UpdateLessonRequest request, Guid lessonId)
        {
            var (result, message) = await lessonRepository.UpdateLesson(request, lessonId);
            return message switch
            {
                "NOT_FOUND_LESSON" => throw new NotFoundException("Không tìm thấy bài học này"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }
    }
}
