using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IConversationService
    {
        public Task<CheckMessageExistedResponse> CheckMessageExisted(CheckMessageExistedRequest request);
        public Task<Guid?> SendMessage(SendMessageRequest request, Guid SenderId);
        public Task<PagedResponse<ConversationResponse>> GetMyConversation(GetConversationFilterRequest request, Guid userId);
        public Task<GetMessageResponse> GetMessage(BaseRequestSecond request, Guid conversationId, Guid userId);
        public Task<Guid?> CreateGroup(CreateGroupRequest request, Guid creatorId);
        public Task<bool> AddMembersToGroup(AddMembersRequest request, Guid userId);
        public Task<bool> LeaveGroup(Guid conversationId, Guid userId);
        public Task<ConversationResponse?> UpdateConversation(UpdateGroupRequest request, Guid conversationId, Guid senderId);
        public Task<bool> DeleteMessageById(Guid messageId, Guid userId);

    }
}
