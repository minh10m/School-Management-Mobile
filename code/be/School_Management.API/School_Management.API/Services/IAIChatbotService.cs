using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IAIChatbotService
    {
        public Task<AIChatResponse> ChatWithAI(AIChatRequest request, Guid userId, string role);
    }
}
