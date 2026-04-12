using School_Management.API.Exceptions;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class LessonVideoService : ILessonVideoService
    {
        private readonly ILessonVideoRepository lessonVideoRepository;

        public LessonVideoService(ILessonVideoRepository lessonVideoRepository)
        {
            this.lessonVideoRepository = lessonVideoRepository;
        }
        public async Task<LessonVideoResponse> CreateLessonVideo(LessonVideoRequest request)
        {
            var (result, message) = await lessonVideoRepository.CreateLessonVideo(request);
            return message switch
            {
                "NOT_FOUND_LESSON" => throw new NotFoundException("Không tìm thấy bài học này"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<LessonVideoResponse> UpdateLessonVideo(UpdateLessonVideoRequest request, Guid lessonVideoId)
        {
            var (result, message) = await lessonVideoRepository.UpdateLessonVideo(request, lessonVideoId);
            return message switch
            {
                "NOT_FOUND_LESSON_VIDEO" => throw new NotFoundException("Không tìm thấy video bài học này"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }
    }
}
