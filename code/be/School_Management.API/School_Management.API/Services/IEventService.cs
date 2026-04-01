using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IEventService
    {
        public Task<EventResponse> CreateEvent(PostOrUpdateEventRequest request);
        public Task<EventResponse> UpdateEvent(PostOrUpdateEventRequest request, Guid eventId);
        public Task<PagedResponse<EventResponse>> GetAllEvent(EventFilterRequest request);
        public Task<EventResponse> GetEventById(Guid eventId);
    }
}
