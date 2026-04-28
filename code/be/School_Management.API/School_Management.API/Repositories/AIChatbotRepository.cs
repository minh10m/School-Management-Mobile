using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.Google;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using School_Management.API.Services;

namespace School_Management.API.Repositories
{
    public class AIChatbotRepository : IAIChatbotRepository
    {
        private readonly ApplicationDbContext context;
        private readonly Kernel kernel;
        private readonly ISchoolYearInfoService schoolYearInfo;
        private readonly IStudentRepository studentRepository;
        private readonly IScheduleRepository scheduleRepository;

        public AIChatbotRepository(ApplicationDbContext context, Kernel kernel, ISchoolYearInfoService schoolYearInfo, IStudentRepository studentRepository, IScheduleRepository scheduleRepository)
        {
            this.context = context;
            this.kernel = kernel;
            this.schoolYearInfo = schoolYearInfo;
            this.studentRepository = studentRepository;
            this.scheduleRepository = scheduleRepository;
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
                var schoolyearInfoDetail = await schoolYearInfo.GetSchoolYearInfo();
                var chatKernel = kernel.Clone();
                if(role == "Student")
                    chatKernel.Plugins.AddFromObject(new StudentPlugin(role, userId, context, studentRepository, scheduleRepository));


                var chatHistory = new ChatHistory();
                chatHistory.AddSystemMessage($@"Bạn là trợ lý EduManage. Quy tắc:
                                                1. NGHIỆP VỤ: Chỉ hỗ trợ điểm, lịch học/thi, sự kiện, học phí, nội quy. Khác: Từ chối lịch sự. Sai định dạng: Yêu cầu cung cấp câu hỏi phù hợp.
                                                2. DỮ LIỆU: Trả về [] -> Báo chưa có dữ liệu. Không Thêm/Xóa/Sửa -> Báo nằm ngoài khả năng. Danh sách >15: Chỉ hiện 5 bản ghi mới nhất + yêu cầu lọc thêm.
                                                3. BẢO MẬT (Role: {role}): Chỉ xem thông tin cá nhân. Hỏi về người khác -> Từ chối. Hỏi theo tên -> Yêu cầu xác nhận chính chủ.
                                                4. HIỂN THỊ: Hiển thị dạng danh sách trên xuống, không bảng + Icon (📅, 📘, ⏱️, ✅). Tiền tệ: Thêm dấu phân cách (VD: 2.000.000 VNĐ).
                                                5. STYLE: Thân thiện. Thiếu tham số bắt buộc (VD: Năm học) -> Phải hỏi lại người dùng.
                                                6. Năm học băt đầu hiện tại: {schoolyearInfoDetail?.SchoolYear}, học kì hiện tại là {schoolyearInfoDetail?.Term}. Vẫn yêu cầu người dùng cung cấp năm học kì học nếu không có.
                                                7. STRICT RULE: Tuyệt đối KHÔNG sử dụng định dạng bảng (Markdown Table) cho danh sách. Hãy sử dụng định dạng danh sách có ký hiệu đầu dòng (Bullet points) hoặc đánh số. Mỗi mục phải phân tách rõ ràng bằng xuống dòng.");

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
