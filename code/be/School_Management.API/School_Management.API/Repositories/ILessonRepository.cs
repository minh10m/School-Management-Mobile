using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface ILessonRepository
    {
        public Task<(LessonResponse? data, string? message)> CreateLesson(LessonRequest request);
        public Task<(LessonResponse? data, string? message)> UpdateLesson(UpdateLessonRequest request, Guid lessonId);
        public Task<(PagedResponse<LessonResponse>? data, string? message)> GetAllLessonOfCourse(LessonFilterRequest request);
        public Task<(LessonResponse? data, string message)> GetLessonById(Guid lessonId);

    }
}
