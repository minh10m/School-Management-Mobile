namespace School_Management.API.Services
{
    public interface IFirebaseService
    {
        public Task UpdateConversation(Guid conversationId, Guid senderId, List<Guid> receiverIds);
        public Task ResetUnreadCount(Guid conversationId, Guid userId);
        public Task CreateGroupConversation(Guid conversationId, List<Guid> memberIds);
        public Task UpdateGroupMembers(Guid conversationId, List<Guid> allMemberIds);

    }
}
