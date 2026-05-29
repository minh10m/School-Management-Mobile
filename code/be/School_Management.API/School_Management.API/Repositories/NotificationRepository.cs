using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using School_Management.API.Services;

namespace School_Management.API.Repositories
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly ApplicationDbContext context;
        private readonly ISchoolYearInfoRepository schoolYearInfoRepository;
        private readonly IFirebaseService firebaseService;
        private readonly ILogger<NotificationRepository> logger;

        public NotificationRepository(ApplicationDbContext context, ISchoolYearInfoRepository schoolYearInfoRepository, IFirebaseService firebaseService, ILogger<NotificationRepository> logger)
        {
            this.context = context;
            this.schoolYearInfoRepository = schoolYearInfoRepository;
            this.firebaseService = firebaseService;
            this.logger = logger;
        }

        public async Task<(bool result, string message)> CreateNotification(CreateNotificationRequest request)
        {
            var schoolYear = await schoolYearInfoRepository.GetSchoolYearInfo();
            if (schoolYear == null) return (false, "NOT_FOUND_SCHOOLYEAR");

            var notifications = request.UserId.Select(userId => new Notification
            {
                Id = Guid.NewGuid(),
                SchoolYear = schoolYear.SchoolYear,
                Content = request.Content,
                CreatedAt = DateTimeOffset.UtcNow,
                IsPopup = false,
                IsRead = false,
                Title = request.Title,
                Type = request.Type,
                UserId = userId
            }).ToList();


            try
            {
                context.Notification.AddRange(notifications);
                await context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Create notification database failed");
                return (false, "DATABASE_ERROR");
            }

            try
            {
                var unreadCounts = await context.Notification
                    .AsNoTracking()
                    .Where(x =>
                        request.UserId.Contains(x.UserId) &&
                        !x.IsRead)
                    .GroupBy(x => x.UserId)
                    .Select(g => new
                    {
                        UserId = g.Key,
                        Count = g.Count()
                    })
                    .ToDictionaryAsync(x => x.UserId, x => x.Count);

                var firebaseTasks = notifications.Select(notification =>
                {
                    var count = unreadCounts.GetValueOrDefault(notification.UserId, 0);

                    return firebaseService.CreateNotification(
                        notification.UserId,
                        count,
                        notification);
                });

                await Task.WhenAll(firebaseTasks);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Firebase push failed");
            }

            return (true, "SUCCESS");
        }

        public async Task<(bool result, string message)> DeleteNotificationById(Guid notificationId)
        {
            var notification = await context.Notification.FindAsync(notificationId);
            if (notification == null) return (false, "NOT_FOUND_NOTIFICATION");

            context.Notification.Remove(notification);
            await context.SaveChangesAsync();
            return (true, "SUCCESS");
        }

        public async Task<(PagedResponse<NotificationResponse>? result, string message)> GetAllNotifications(Guid userId, BaseRequestSecond request)
        {
            var result = await schoolYearInfoRepository.GetSchoolYearInfo();
            if (result == null) return (null, "NOT_FOUND_SCHOOLYEAR");
            var query = context.Notification.AsNoTracking().Where(x => x.UserId == userId && x.SchoolYear == result.SchoolYear).AsQueryable();

            var totalCount = await query.CountAsync();
            var skipResults = (request.PageNumber - 1) * request.PageSize;
            var listResult = await query.OrderByDescending(x => x.CreatedAt)
                                        .Skip(skipResults).Take(request.PageSize)
                                        .Select(g => new NotificationResponse
                                        {
                                            Id = g.Id,
                                            Content = g.Content,
                                            CreatedAt = g.CreatedAt,
                                            IsPopup = g.IsPopup,
                                            IsRead = g.IsRead,
                                            SchoolYear = g.SchoolYear,
                                            Title = g.Title,
                                            Type = g.Type,
                                            UserId = g.UserId
                                        }).ToListAsync();

            await context.Notification.Where(x => x.UserId == userId && !x.IsRead && x.SchoolYear == result.SchoolYear).ExecuteUpdateAsync(g => g.SetProperty(m => m.IsRead, m => true));
            await firebaseService.ResetUnreadCountNoti(userId);

            return (new PagedResponse<NotificationResponse>
            {
                PageSize = request.PageSize,
                Items = listResult,
                PageNumber = request.PageNumber,
                TotalCount = totalCount
            }, "SUCCESS");
        }


    }
}
