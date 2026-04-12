using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface ILessonService
    {
        public Task<LessonResponse> CreateLesson(LessonRequest request);
    }
}
