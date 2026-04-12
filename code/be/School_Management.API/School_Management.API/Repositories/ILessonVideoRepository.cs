using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface ILessonVideoRepository
    {
        public Task<(LessonVideoResponse? data, string message)> CreateLessonVideo(LessonVideoRequest request);
        public Task<(LessonVideoResponse? data, string message)> UpdateLessonVideo(UpdateLessonVideoRequest request, Guid lessonVideoId);
        public Task<(PagedResponse<LessonVideoResponse>? data, string message)> GetAllLessonVideoOfLesson(LessonVideoFilterRequest request);
        public Task<(LessonVideoResponse? data, string message)> GetLessonVideoById(Guid lessonVideoId);

    }
}
