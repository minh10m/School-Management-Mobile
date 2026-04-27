using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IAIChatbotRepository
    {
        public Task<AIChatResponse> ChatWithAI(AIChatRequest request, Guid userId, string role);

    }
}
