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

            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                SchoolYear = schoolYear.SchoolYear,
                Content = request.Content,
                CreatedAt = DateTimeOffset.UtcNow,
                IsPopup = false,
                IsRead = false,
                Title = request.Tiltle,
                Type = request.Type,
                UserId = request.UserId
            };

            using (var transaction = await context.Database.BeginTransactionAsync())
            {
                try
                {
                    context.Notification.Add(notification);
                    await context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    return (false, "DATABASE_ERROR"); 
                }
            }

            try
            {
                var unReadCounts = await context.Notification.AsNoTracking().CountAsync(x => x.UserId == request.UserId && !x.IsRead);
                await firebaseService.CreateNotification(notification.UserId, unReadCounts, notification);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Firebase signal failed for user {UserId}", notification.UserId);
            }

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
