using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.Google;
using Microsoft.SemanticKernel.Embeddings;
using Microsoft.SemanticKernel.Text;
using Pgvector.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using School_Management.API.Services;
using System.ComponentModel;
using UglyToad.PdfPig;
using Xceed.Words.NET;

namespace School_Management.API.Repositories
{
    public class AIChatbotRepository : IAIChatbotRepository
    {
        private readonly ApplicationDbContext context;
        private readonly Kernel kernel;
        private readonly ISchoolYearInfoService schoolYearInfo;
        private readonly IStudentRepository studentRepository;
        private readonly IScheduleRepository scheduleRepository;
        private readonly ITeacherRepository teacherRepository;

        public AIChatbotRepository(ApplicationDbContext context, Kernel kernel, ISchoolYearInfoService schoolYearInfo, IStudentRepository studentRepository, IScheduleRepository scheduleRepository, ITeacherRepository teacherRepository)
        {
            this.context = context;
            this.kernel = kernel;
            this.schoolYearInfo = schoolYearInfo;
            this.studentRepository = studentRepository;
            this.scheduleRepository = scheduleRepository;
            this.teacherRepository = teacherRepository;
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
                var contextFromRag = await GetSchoolInformation(request.UserQuestion);
                if (string.IsNullOrWhiteSpace(contextFromRag)) contextFromRag = "Không có dữ liệu";


                if (role == "Student")  
                    chatKernel.Plugins.AddFromObject(new StudentPlugin(role, userId, context, studentRepository, scheduleRepository, kernel));
                else if (role == "Teacher")
                    chatKernel.Plugins.AddFromObject(new TeacherPlugin(role, userId, context, scheduleRepository, teacherRepository, kernel));


                    var chatHistory = new ChatHistory();
                chatHistory.AddSystemMessage($@"Bạn là trợ lý EduManage. ĐÂY LÀ DỮ LIỆU NỘI QUY HỌC ĐƯỜNG HOẶC HƯỚNG DẪN SỬ DỤNG APP TRONG FILE RAG HỆ THỐNG. Context {contextFromRag}
                                                                         NẾU NGƯỜI DÙNG HỎI CÂU HỎI LIÊN QUAN TỚI NỘI QUY, HOẶC LÀ NỘI DUNG MÀ BẠN THẤY LIÊN QUAN TỚI HƯỚNG DẪN SỬ DỤNG, 
                                                                         HAY ĐƠN GIẢN LÀ CÂU HỎI ĐÓ CÓ KO CÓ TRONG DANH SÁCH FUNCTIONCALLING Ở DƯỚI, THÌ HÃY CHÚ Ý HƯỚNG DẪN NGƯỜI DÙNG THAO TÁC
                                                                         TỪ FILE HƯỚNG DẪN CÁCH ĐỂ CÓ ĐƯỢC DỮ LIỆU HỌ MUỐN NHÉ, LƯU Ý CÂN NHẮC KĨ TRƯỚC KHI SỬ DỤNG VÀ THAM KHẢO NỘI DUNG Ở DƯỚI NỮA.
                                                   Quy tắc: 
                                                1. NGHIỆP VỤ: Chỉ hỗ trợ điểm, lịch học/thi, sự kiện, học phí, nội quy, hướng dẫn sử dụng app. Khác: Từ chối lịch sự. Sai định dạng: Yêu cầu cung cấp câu hỏi phù hợp.
                                                2. DỮ LIỆU: Trả về [] -> Báo chưa có dữ liệu. Không Thêm/Xóa/Sửa -> Báo nằm ngoài khả năng. Danh sách >15: Chỉ hiện 5 bản ghi mới nhất + yêu cầu lọc thêm.
                                                3. BẢO MẬT (Role hiện tại: {role}): Chỉ xem thông tin cá nhân. Hỏi về người khác -> Từ chối. Hỏi theo tên -> Yêu cầu xác nhận chính chủ.
                                                4. HIỂN THỊ: Hiển thị dạng danh sách trên xuống, không bảng + Icon (📅, 📘, ⏱️, ✅). Tiền tệ: Thêm dấu phân cách (VD: 2.000.000 VNĐ).
                                                5. STYLE: Thân thiện. Thiếu tham số bắt buộc (VD: Năm học) -> Phải hỏi lại người dùng.
                                                6. Năm học hiện tại: {schoolyearInfoDetail?.SchoolYear} - {schoolyearInfoDetail?.SchoolYear + 1}, học kì hiện tại là {schoolyearInfoDetail?.Term}. Vẫn yêu cầu người dùng cung cấp năm học kì học nếu không có.
                                                7. STRICT RULE: Tuyệt đối KHÔNG sử dụng định dạng bảng (Markdown Table) cho danh sách. Hãy sử dụng định dạng danh sách có ký hiệu đầu dòng (Bullet points) hoặc đánh số. Mỗi mục phải phân tách rõ ràng bằng xuống dòng.
                                                8. Nếu người dùng hỏi về nghiệp vụ, và không có plugin đáp ứng cho ra dữ liệu được, hãy tìm kiếm về hướng dẫn sử dụng, thao tác app và tiến hành định hướng bước làm cho người dùng để họ đạt được mục tiêu rồi trả lời cho phù hợp, NẾU KHÔNG CÓ DỮ LIỆU PHÙ HỢP TUYỆT ĐỐI KO BỊA
                                                9. ""Hãy ưu tiên dữ liệu trong Context. Nếu câu hỏi của người dùng có ý nghĩa tương đồng với chỉ dẫn trong Context (ví dụ: 'đổi mật khẩu' và 'thay đổi pass'), hãy dùng dữ liệu đó để trả lời."" ");

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

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Selection", "SKEXP0050")]
        public async Task<bool> UploadKnowledgeBase(IFormFile file)
        {
            string extractedFile = "";
            
            if(file.FileName.EndsWith(".txt"))
            {
                using var reader = new StreamReader(file.OpenReadStream());
                extractedFile = await reader.ReadToEndAsync();
            }
            else if(file.FileName.EndsWith(".pdf"))
            {
                using var document = PdfDocument.Open(file.OpenReadStream());
                foreach(var page in document.GetPages())
                {
                    extractedFile += page.Text + " ";
                }
            }
            else if(file.FileName.EndsWith(".docx"))
            {
                using(var stream = file.OpenReadStream())
                {
                    using (var doc = DocX.Load(stream))
                    {
                        extractedFile = doc.Text;
                    }
                }
            }

            if(!string.IsNullOrWhiteSpace(extractedFile))
            {
                using var transaction = await context.Database.BeginTransactionAsync();
                try
                {
                    var oldData = await context.KnowledgeBase.ExecuteDeleteAsync();

#pragma warning disable SKEXP0050 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
                    var lines = TextChunker.SplitPlainTextLines(extractedFile, 32);    
                    var chunks = TextChunker.SplitPlainTextParagraphs(lines, 250, 100);
#pragma warning restore SKEXP0050 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.

                    var embeddingService = kernel.Services.GetRequiredService<ITextEmbeddingGenerationService>();
                    var embeddings = await embeddingService.GenerateEmbeddingsAsync(chunks);

                    for(int i = 0; i < chunks.Count; i++)
                    {
                        context.KnowledgeBase.Add(new KnowledgeBase
                        {
                            Id = Guid.NewGuid(),
                            Content = chunks[i],
                            Title = file.FileName,
                            Embedding = new Pgvector.Vector(embeddings[i].ToArray())
                        });
                    }

                    await context.SaveChangesAsync();
                    await transaction.CommitAsync();
                    return true;
                }

                
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(ex.Message.ToString());
                    throw;
                }
            }

            return false;
        }

        
        public async Task<string> GetSchoolInformation(string query)
        {
            var embeddingService = kernel.Services.GetRequiredService<ITextEmbeddingGenerationService>();
            var vector = await embeddingService.GenerateEmbeddingAsync(query);
            var vectorQuery = new Pgvector.Vector(vector.ToArray());

            // 2. Tìm kiếm top 5 đoạn văn bản tương đồng nhất
            var chunks = await context.KnowledgeBase
                .OrderBy(x => x.Embedding.CosineDistance(vectorQuery))
                .Take(5)
                .Select(x => x.Content)
                .ToListAsync();

            var result = string.Join("\n\n", chunks);

            Console.WriteLine($"--- RAG Context cho câu hỏi '{query}': ---\n{result}\n----------------");
            return result;
        }
    }
}
