using School_Management.API.Models.Domain;

namespace School_Management.API.Services
{
    public interface IFirebaseService
    {
        public Task UpdateConversation(Guid conversationId, List<Guid> receiverIds, Message message, string senderName);
        public Task ResetUnreadCount(Guid conversationId, Guid userId);
        public Task CreateGroupConversation(Guid conversationId, List<Guid> memberIds);
        public Task UpdateGroupMembers(Guid conversationId, List<Guid> allMemberIds);
        public Task CreateNotification(Guid userId, int unReadQuantity, Notification request);
        public Task ResetUnreadCountNoti(Guid userId);
        public Task RecallMessage(Guid conversationId, Guid messageId, bool isLastMessage);
        
    }
}
