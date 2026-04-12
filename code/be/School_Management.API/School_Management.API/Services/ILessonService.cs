using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface ILessonService
    {
        public Task<LessonResponse> CreateLesson(LessonRequest request);
        public Task<LessonResponse> UpdateLesson(UpdateLessonRequest request, Guid lessonId);
        public Task<PagedResponse<LessonResponse>> GetAllLessonOfCourse(LessonFilterRequest request);
        public Task<LessonResponse> GetLessonById(Guid lessonId);
    }
}
