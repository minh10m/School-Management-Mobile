using CloudinaryDotNet;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Middlewares;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using School_Management.API.Services;
using System.Text.RegularExpressions;
using Xceed.Document.NET;

namespace School_Management.API.Repositories
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly ApplicationDbContext context;
        private readonly IHubContext<PaymentHub> _hubContext;
        private readonly INotificationService notificationService;
        private readonly ILogger<PaymentRepository> logger;

        public PaymentRepository(ApplicationDbContext context, IHubContext<PaymentHub> hubContext, INotificationService notificationService, ILogger<PaymentRepository> logger)
        {
            this.context = context;
            _hubContext = hubContext;
            this.notificationService = notificationService;
            this.logger = logger;
        }
        public async Task<IEnumerable<Payment>> GetMyPayments(Guid userId)
        {
            return await context.Payment
                .Include(p => p.User)
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Payment>> GetAllPayments()
        {
            return await context.Payment
                .Include(p => p.User)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<(PaymentResponse? data, string message)> PayTheBill(PaymentRequest request, Guid userId)
        {
            if (request.FeeDetailId.HasValue && request.CourseId.HasValue) return (null, "BOTH_HAVE_VALUE");
            if (request.FeeDetailId == null && request.CourseId == null) return (null, "BOTH_ARE_NULL");
            var student = await context.Student.Include(x => x.User).Where(x => x.UserId == userId).FirstOrDefaultAsync();
            if (student == null) return (null, "NOT_FOUND_STUDENT");

            decimal amount = 0;
            string description = "";
            Guid? courseId = null;
            Guid? feeDetailId = null;

            if (request.CourseId.HasValue)
            {
                var course = await context.Course.Include(x => x.TeacherSubject).ThenInclude(x => x.Teacher).FirstOrDefaultAsync(x => x.Id == request.CourseId);
                if (course == null) return (null, "NOT_FOUND_COURSE");

                var isExisted = await context.EnrollCourse.AnyAsync(x => x.StudentId == student.Id && x.CourseId == request.CourseId);
                if (isExisted) return (null, "YOU_BUY_THIS_COURSE");

                amount = course.Price;
                description = $"Thanh toán {course.CourseName.ToLower()}";
                courseId = course.Id;
            }
            else
            {
                var feeDetail = await context.FeeDetail.FirstOrDefaultAsync(x => x.Id == request.FeeDetailId);
                if (feeDetail == null) return (null, "NOT_FOUND_FEE_DETAIL");

                amount = feeDetail.AmountDue;
                description = $"Thanh toán {feeDetail.Reason.ToLower()}";
                feeDetailId = feeDetail.Id;
            }

            var random = new Random().Next(100, 999);
            var digit = DateTime.Now.ToString("yyMMddHHmmss") + random;

            var payment = new Payment
            {
                Id = Guid.NewGuid(),
                Status = "Chưa đóng",
                ActualAmount = 0,
                Amount = amount,
                FeeDetailId = feeDetailId,
                CourseId = courseId,
                CreatedAt = DateTimeOffset.Now.ToUniversalTime(),
                PaidAt = null,
                Type = courseId != null ? "Course" : "Fee",
                UserId = userId,
                TransactionId = null,
                Description = description,
                OrderCode = $"Bill{digit}",
            };

            context.Payment.Add(payment);
            await context.SaveChangesAsync();

            var result = new PaymentResponse
            {
                Description = payment.Description,
                AccountName = "LE THI HONG ANH",
                AccountNumber = "6201438366",
                Amount = payment.Amount,
                BankName = "BIDV",
                Bin = "970418",
                OrderCode = payment.OrderCode,
                PaymentId = payment.Id,
                QrCodeUrl = $"https://qr.sepay.vn/img?bank=MBBank&acc=VQRQAILYM9270&template=compact&amount={payment.Amount}&des={payment.OrderCode}"
            };
            
            return (result, "SUCCESS");
        }

        public async Task<(bool result, string message)> ProcessWebhook(SepayWebhookRequest request)
        {
            var sepayId = request.Id.ToString();
            var isExisted = await context.Payment.AnyAsync(x => x.TransactionId == sepayId);
            if (isExisted) return (false, "DUPLICATE_TRANSACTION");

            var orderCode = request.Content?.Trim().ToLower();
            if (string.IsNullOrEmpty(orderCode)) return (false, "ORDER_CODE_NOT_FOUND");

            var payment = await context.Payment
                .Where(x => x.Status == "Chưa đóng")
                .FirstOrDefaultAsync(x => orderCode.Contains(x.OrderCode.ToLower()));

            if (payment == null) return (false, "PAYMENT_NOT_FOUND");

            string userId = payment.UserId.ToString();

            var student = await context.Student
                .Include(x => x.User)
                .Where(x => x.UserId == payment.UserId)
                .FirstOrDefaultAsync();

            if (student == null)
            {
                await SendPaymentNotify(userId, false, "Không tìm thấy thông tin sinh viên.");
                return (false, "NOT_FOUND_STUDENT");
            }

            if (request.TransferAmount < payment.Amount)
            {
                await SendPaymentNotify(userId, false, $"Bạn chuyển thiếu tiền! Cần {payment.Amount:N0}đ nhưng nhận được {request.TransferAmount:N0}đ.");
                return (false, "INSUFFICIENT_AMOUNT");
            }

            Course? course = null;
            if (payment.CourseId.HasValue)
            {
                course = await context.Course
                    .Include(x => x.TeacherSubject)
                    .ThenInclude(x => x.Teacher)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.Id == payment.CourseId);
            }

            string studentName = student.User?.FullName ?? "Học viên";
            string itemName = "Học phí";
            if (payment.CourseId.HasValue && course != null) itemName = course.CourseName;

            var adminIds = await (
                from user in context.Users
                join userRole in context.UserRoles on user.Id equals userRole.UserId
                join role in context.Roles on userRole.RoleId equals role.Id
                where role.Name == "Admin"
                select user.Id
            ).Distinct().ToListAsync();

            var notifyUserIds = new List<Guid>();
            if (payment.CourseId.HasValue && course != null)
                notifyUserIds.Add(course.TeacherSubject.Teacher.UserId);
            else
                notifyUserIds.AddRange(adminIds);

            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                payment.Status = "Đã đóng";
                payment.PaidAt = DateTimeOffset.UtcNow.ToUniversalTime();
                payment.ActualAmount = request.TransferAmount;
                payment.TransactionId = sepayId;

                if (payment.CourseId.HasValue && course != null)
                {
                    context.EnrollCourse.Add(new EnrollCourse
                    {
                        Id = Guid.NewGuid(),
                        CourseId = payment.CourseId.Value,
                        StudentId = student.Id,
                        EnrolledAt = DateTimeOffset.UtcNow.ToUniversalTime()
                    });
                }
                else if (payment.FeeDetailId.HasValue)
                {
                    var feeDetail = await context.FeeDetail
                        .FirstOrDefaultAsync(x => x.Id == payment.FeeDetailId.Value);
                    if (feeDetail != null)
                    {
                        feeDetail.AmountPaid = payment.ActualAmount;
                        feeDetail.PaidAt = DateTimeOffset.UtcNow.ToUniversalTime();
                        feeDetail.Status = "Đã đóng";
                        itemName = feeDetail.Reason; // Cập nhật tên lý do học phí thực tế
                    }
                }

                await context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                logger.LogError(ex, "Transaction failed PaymentId: {Id}", payment.Id);
                return (false, "INTERNAL_ERROR");
            }

            await SendPaymentNotify(userId, true, "Thanh toán thành công!");

            try
            {
                // Thêm dòng log này để biết là code đã chạy tới đây
                Console.WriteLine($"--- ĐANG GỬI FIRESTORE CHO USER: {string.Join(", ", notifyUserIds)} ---");

                await notificationService.CreateNotification(new CreateNotificationRequest
                {
                    Content = $"Học sinh {studentName} đã thanh toán [{itemName}]",
                    Title = payment.CourseId.HasValue ? "Mua khóa học mới" : "Thanh toán học phí",
                    Type = payment.CourseId.HasValue ? "Mua khóa học" : "Thanh toán học phí",
                    UserId = notifyUserIds
                });

                Console.WriteLine("--- FIRESTORE XỬ LÝ XONG ---");
            }
            catch (Exception ex)
            {
                // In ra toàn bộ nội dung lỗi thật sự
                Console.WriteLine("!!! LỖI FIRESTORE RỒI !!!");
                Console.WriteLine($"Message: {ex.Message}");
                Console.WriteLine($"Inner: {ex.InnerException?.Message}");
                Console.WriteLine($"Stack: {ex.StackTrace}");
            }

            return (true, "SUCCESS");
        }
        private async Task SendPaymentNotify(string userId, bool isSuccess, string msg)
        {
            await _hubContext.Clients.User(userId).SendAsync("ReceivePaymentStatus", new
            {
                status = isSuccess ? "Success" : "Error",
                message = msg
            });
        }
    }
}
