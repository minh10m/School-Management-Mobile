using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class AIChatbotService : IAIChatbotService
    {
        private readonly IAIChatbotRepository aIChatbotRepository;

        public AIChatbotService(IAIChatbotRepository aIChatbotRepository)
        {
            this.aIChatbotRepository = aIChatbotRepository;
        }
        public async Task<AIChatResponse> ChatWithAI(AIChatRequest request, Guid userId, string role)
        {
            var result = await aIChatbotRepository.ChatWithAI(request, userId, role);
            return result;
        }
    }
}
