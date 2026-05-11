using School_Management.API.Exceptions;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository notificationRepository;

        public NotificationService(INotificationRepository notificationRepository)
        {
            this.notificationRepository = notificationRepository;
        }

        public async Task<bool> CreateNotification(CreateNotificationRequest request)
        {
            var (result, message) = await notificationRepository.CreateNotification(request);
            return message switch
            {
                "NOT_FOUND_SCHOOLYEAR" => throw new NotFoundException("Không tìm thấy năm học hiện tại"),
                "DATABASE_ERROR" => throw new Exception("Lỗi hệ thống, vui lòng thử lại hoặc liên hệ admin"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<PagedResponse<NotificationResponse>> GetAllNotifications(Guid userId, BaseRequestSecond request)
        {
            var (result, message) = await notificationRepository.GetAllNotifications(userId, request);
            return message switch
            {
                "NOT_FOUND_SCHOOLYEAR" => throw new NotFoundException("Không tìm thấy năm học hiện tại"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }
    }
}
