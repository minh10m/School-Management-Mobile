using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IConversationRepository
    {
        public Task<CheckMessageExistedResponse> CheckMessageExisted(CheckMessageExistedRequest request);
        public Task<(Guid? conversationId, string message)> SendMessage(SendMessageRequest request, Guid SenderId);
        public Task<PagedResponse<ConversationResponse>> GetMyConversation(GetConversationFilterRequest request, Guid userId);
        public Task<(GetMessageResponse? result, string message)> GetMessage(BaseRequestSecond request, Guid conversationId, Guid userId);
        public Task<(Guid? conversationId, string message)> CreateGroup(CreateGroupRequest request, Guid creatorId);
        public Task<(bool result, string message)> AddMembersToGroup(AddMembersRequest request, Guid userId);
        public Task<(bool result, string message)> LeaveGroup(Guid conversationId, Guid userId);
        public Task<(ConversationResponse? result, string message)> UpdateConversation(UpdateGroupRequest request, Guid conversationId, Guid senderId);
    }
}
