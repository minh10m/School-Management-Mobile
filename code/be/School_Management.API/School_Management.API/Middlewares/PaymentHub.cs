using Microsoft.AspNetCore.SignalR;

namespace School_Management.API.Middlewares
{
    public class PaymentHub : Hub
    {
        public async Task JoinPaymentGroup(string userId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
        }
    }
}
