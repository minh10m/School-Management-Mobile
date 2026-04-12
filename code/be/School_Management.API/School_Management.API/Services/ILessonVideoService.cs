using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface ILessonVideoService
    {
        public Task<LessonVideoResponse> CreateLessonVideo(LessonVideoRequest request);
    }
}
