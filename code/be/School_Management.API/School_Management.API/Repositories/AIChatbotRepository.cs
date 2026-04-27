using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.Google;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class AIChatbotRepository : IAIChatbotRepository
    {
        private readonly ApplicationDbContext context;
        private readonly Kernel kernel;

        public AIChatbotRepository(ApplicationDbContext context, Kernel kernel)
        {
            this.context = context;
            this.kernel = kernel;
        }
        public async Task<AIChatResponse> ChatWithAI(AIChatRequest request, Guid userId, string role)
        {
            try
            {
                var messages = await context.AIChatHistory.AsNoTracking().Where(x => x.UserId == userId)
                                                      .OrderByDescending(x => x.CreatedAt)
                                                      .Take(10)
                                                      .OrderBy(x => x.CreatedAt)
                                                      .Select(g => new { g.Role, g.Content })
                                                      .ToListAsync();
                var chatKernel = kernel.Clone();
                chatKernel.Plugins.AddFromObject(new StudentPlugin(role, userId, context));


                var chatHistory = new ChatHistory();
                chatHistory.AddSystemMessage($@"Bạn là trợ lý ảo chuyên nghiệp của ứng dụng EduManage. Hãy tuân thủ nghiêm ngặt các quy tắc sau:

                                                1. PHẠM VI NGHIỆP VỤ:
                                                    - Chỉ trả lời các vấn đề: điểm số, lịch học, lịch thi, sự kiện, học phí và nội quy trường học.
                                                    - Với các câu hỏi ngoài nghiệp vụ hoặc kiến thức chung: Trả lời ""Câu hỏi này nằm ngoài phạm vi hỗ trợ của mình, bạn vui lòng đặt câu hỏi khác liên quan đến trường học nhé"".
                                                    - Nếu người dùng gửi dữ liệu sai định dạng: Trả lời ""Vui lòng cung cấp câu hỏi phù hợp, mình luôn sẵn sàng hỗ trợ bạn"".

                                                2. XỬ LÝ DỮ LIỆU:
                                                    - Nếu kết quả từ hàm trả về rỗng []: Trả lời ""Hiện tại mình chưa tìm thấy thông tin này của bạn, vui lòng kiểm tra lại trên hệ thống nhé"".
                                                    - Không thực hiện Thêm/Xóa/Sửa dữ liệu: Trả lời ""Xin lỗi, việc chỉnh sửa dữ liệu nằm ngoài khả năng của mình"".
                                                    - Nếu danh sách quá dài (>15 items): Chỉ hiển thị 10-15 bản ghi mới nhất và gợi ý người dùng cung cấp thêm điều kiện lọc (năm học, học kỳ...) để kết quả chính xác hơn.

                                                3. BẢO MẬT & PHÂN QUYỀN (Role: {{role}}):
                                                    - Chỉ truy cập thông tin của chính người dùng hiện tại. 
                                                    - Nếu người dùng (Student) hỏi về người khác: Trả lời ""Xin lỗi, mình chỉ được phép cung cấp thông tin cá nhân của bạn, không thể tiết lộ thông tin của người khác"".
                                                    - Nếu người dùng hỏi theo tên riêng: Yêu cầu họ xác nhận đó là chính họ trước khi cung cấp.

                                                4. ĐỊNH DẠNG HIỂN THỊ:
                                                    - Có từ 2 bản ghi trở lên: Luôn sử dụng bảng Markdown.
                                                    - Chỉ có 1 bản ghi: Sử dụng danh sách kèm icon (📅, 📘, ⏱️, ✅).
                                                    - Tiền tệ: Phải có dấu phân cách hàng nghìn (VD: 2.000.000 VNĐ).

                                                5. PHONG CÁCH:
                                                    - Trả lời thân thiện, gần gũi, sử dụng ngôn ngữ tự nhiên. 
                                                    - Nếu thiếu tham số bắt buộc (như Năm học): Phải hỏi lại và yêu cầu người dùng cung cấp đầy đủ.
                                                Hiện tại role là {role}");

                foreach (var message in messages)
                {
                    if (message.Role == "USER")
                    {
                        chatHistory.AddUserMessage(message.Content);
                    }
                    else if (message.Role == "AI")
                    {
                        chatHistory.AddAssistantMessage(message.Content);
                    }
                }
                var settings = new GeminiPromptExecutionSettings
                {
                    FunctionChoiceBehavior = FunctionChoiceBehavior.Auto(),
                    
                };

                chatHistory.AddUserMessage(request.UserQuestion);
                context.AIChatHistory.Add(new AIChatHistory
                {
                    Id = Guid.NewGuid(),
                    Content = request.UserQuestion,
                    CreatedAt = DateTime.UtcNow,
                    Role = "USER",
                    UserId = userId
                });

                var chatService = chatKernel.GetRequiredService<IChatCompletionService>();
                var response = await chatService.GetChatMessageContentAsync(chatHistory, settings, chatKernel);
                context.AIChatHistory.Add(new AIChatHistory
                {
                    Id = Guid.NewGuid(),
                    Content = response.ToString(),
                    CreatedAt = DateTime.UtcNow,
                    Role = "AI",
                    UserId = userId
                });

                await context.SaveChangesAsync();

                var result = new AIChatResponse { AIResponse = response.ToString() };
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi rồi: {ex.Message}");
                return new AIChatResponse { AIResponse = "Hiện hệ thống đang gặp một chút sự cố, bạn vui lòng chờ một chút hoặc thử lại sau nhé." };
            }
            
        }
    }
}
