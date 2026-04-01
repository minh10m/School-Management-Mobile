using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IEventRepository
    {
        public Task<(EventResponse? data, string? errorCode)> CreateEvent(PostOrUpdateEventRequest request);

        public Task<(EventResponse? data, string? errorCode)> UpdateEvent(PostOrUpdateEventRequest request, Guid eventId);

        public Task<PagedResponse<EventResponse>> GetAllEvent(EventFilterRequest request);
        public Task<(EventResponse? data, string? errorCode)> GetEventById(Guid eventId);

    }
}
