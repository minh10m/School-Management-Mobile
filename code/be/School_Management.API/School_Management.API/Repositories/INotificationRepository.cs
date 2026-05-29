using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface INotificationRepository
    {
        public Task<(bool result, string message)> CreateNotification(CreateNotificationRequest request);
        public Task<(PagedResponse<NotificationResponse>? result, string message)> GetAllNotifications(Guid userId, BaseRequestSecond request);
        public Task<(bool result, string message)> DeleteNotificationById(Guid notificationId);
    }
}
