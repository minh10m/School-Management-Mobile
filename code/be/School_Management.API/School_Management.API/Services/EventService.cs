using School_Management.API.Exceptions;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class EventService : IEventService
    {
        private readonly IEventRepository eventRepository;

        public EventService(IEventRepository eventRepository)
        {
            this.eventRepository = eventRepository;
        }

        public async Task<EventResponse> CreateEvent(PostOrUpdateEventRequest request)
        {
            var (result, errorCode) = await eventRepository.CreateEvent(request);
            return errorCode switch
            {
                "INVALID_TIME" => throw new BadRequestException("Thời gian bắt đầu không được lớn hơn thời gian kết thúc"),
                "DUPLICATE_TITLE" => throw new ConflictException("Sự kiện này đã tồn tại"),
                _ => result!
            };
        }

        public async Task<PagedResponse<EventResponse>> GetAllEvent(EventFilterRequest request)
        {
            return await eventRepository.GetAllEvent(request);
        }

        public async Task<EventResponse> GetEventById(Guid eventId)
        {
            var (result, errorCode) = await eventRepository.GetEventById(eventId);
            return errorCode switch
            {
                "NOT_FOUND_EVENT" => throw new NotFoundException("Sự kiện này không tồn tại"),
                _ =>  result!
            };
        }

        public async Task<EventResponse> UpdateEvent(PostOrUpdateEventRequest request, Guid eventId)
        {
            var (result, errorCode) = await eventRepository.UpdateEvent(request, eventId);
            return errorCode switch
            {
                "INVALID_TIME" => throw new BadRequestException("Thời gian bắt đầu không được lớn hơn thời gian kết thúc"),
                "DUPLICATE_TITLE" => throw new ConflictException("Tiêu đề sự kiện này đã tồn tại"),
                "NOT_FOUND_EVENT" => throw new NotFoundException("Sự kiện này không tồn tại"),
                _ => result!
            };
        }
    }
}
