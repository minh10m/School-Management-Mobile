using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface INotificationService
    {
        public Task<bool> CreateNotification(CreateNotificationRequest request);
        public Task<PagedResponse<NotificationResponse>> GetAllNotifications(Guid userId, BaseRequestSecond request);
    }
}
