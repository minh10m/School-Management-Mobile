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
    }
}
