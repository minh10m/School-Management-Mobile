using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IAIChatbotRepository
    {
        public Task<AIChatResponse> ChatWithAI(AIChatRequest request, Guid userId, string role);
        public Task<bool> UploadKnowledgeBase(IFormFile file);
        public Task<PagedResponse<UserAIHistoryChatResponse>> GetUserAIHistoryChatResponses(BaseRequestSecond baseRequest, Guid userId);
        public Task<bool> DeleteChatHistory(Guid userId);
    }
}
