using School_Management.API.Exceptions;
using School_Management.API.Models.Domain;
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

        public async Task<PagedResponse<LessonVideoResponse>> GetAllLessonVideoOfLesson(LessonVideoFilterRequest request)
        {
            var (result, message) = await lessonVideoRepository.GetAllLessonVideoOfLesson(request);
            return message switch
            {
                "NOT_FOUND_LESSON" => throw new NotFoundException("Không tìm thấy bài học này"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<LessonVideoResponse> GetLessonVideoById(Guid lessonVideoId)
        {
            var (result, message) = await lessonVideoRepository.GetLessonVideoById(lessonVideoId);
            return message switch
            {
                "NOT_FOUND_LESSONVIDEO" => throw new NotFoundException("Không tìm thấy video bài học"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<bool> HardDeleteLessonVideo(Guid videoId, Guid userId)
        {
            var (result, message) = await lessonVideoRepository.HardDeleteLessonVideo(videoId, userId);
            return message switch
            {
                "NOT_FOUND_TEACHER" => throw new NotFoundException("Bạn không phải là giáo viên"),
                "NOT_FOUND_VIDEO" => throw new NotFoundException("Không tìm thấy video để xóa"),
                "NOT_IS_TEACHER_OF_COURSE" => throw new ForbiddenException("Bạn không là giáo viên của khóa học này"),
                "SUCCESS" => true,
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
