
using School_Management.API.Data;

namespace School_Management.API.Services
{
    public class PaymentCleanUpService : BackgroundService
    {
        private readonly IServiceProvider serviceProvider;

        public PaymentCleanUpService(IServiceProvider serviceProvider)
        {
            this.serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while(!stoppingToken.IsCancellationRequested)
            {
                using(var scope = serviceProvider.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    var expirePayment = context.Payment.Where(x => x.Status == "Chưa đóng" && x.CreatedAt < DateTime.UtcNow.AddMinutes(-10));

                    context.Payment.RemoveRange(expirePayment);
                    await context.SaveChangesAsync();
                }
                await Task.Delay(TimeSpan.FromMinutes(10), stoppingToken);
            }
        }
    }
}
