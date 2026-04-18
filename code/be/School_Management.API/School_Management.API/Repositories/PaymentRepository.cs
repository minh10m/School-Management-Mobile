using CloudinaryDotNet;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Middlewares;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using System.Text.RegularExpressions;

namespace School_Management.API.Repositories
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly ApplicationDbContext context;
        private readonly IHubContext<PaymentHub> _hubContext;
        public PaymentRepository(ApplicationDbContext context, IHubContext<PaymentHub> hubContext)
        {
            this.context = context;
            _hubContext = hubContext;
        }
        public async Task<(PaymentResponse? data, string message)> PayTheBill(PaymentRequest request, Guid userId)
        {
            if (request.FeeDetailId.HasValue && request.CourseId.HasValue) return (null, "BOTH_HAVE_VALUE");
            if (request.FeeDetailId == null && request.CourseId == null) return (null, "BOTH_ARE_NULL");
            var studentId = await context.Student.Where(x => x.UserId == userId).Select(g => g.Id).FirstOrDefaultAsync();
            if (studentId == Guid.Empty) return (null, "NOT_FOUND_STUDENT");

            decimal amount = 0;
            string description = "";
            Guid? courseId = null;
            Guid? feeDetailId = null;

            if (request.CourseId.HasValue)
            {
                var course = await context.Course.FirstOrDefaultAsync(x => x.Id == request.CourseId);
                if (course == null) return (null, "NOT_FOUND_COURSE");

                var isExisted = await context.EnrollCourse.AnyAsync(x => x.StudentId == studentId && x.CourseId == request.CourseId);
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
                QrCodeUrl = $"https://qr.sepay.vn/img?bank=BIDV&acc=6201438366&template=compact&amount={payment.Amount}&des={payment.OrderCode}"
            };

            return (result, "SUCCESS");
        }

        public async Task<(bool result, string message)> ProcessWebhook(SepayWebhookRequest request)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var match = Regex.Match(request.Content, @"Bill\d+");
                if (!match.Success) return (false, "ORDER_CODE_NOT_FOUND");

                string orderCode = match.Value;

                var payment = await context.Payment.FirstOrDefaultAsync(x => x.OrderCode == orderCode && x.Status == "Pending");
                if (payment == null) return (false, "PAYMENT_NOT_FOUND");

                string userId = payment.UserId.ToString();

                if (request.TransferAmount < payment.Amount)
                {
                    await SendPaymentNotify(userId, false, $"Bạn chuyển thiếu tiền rồi! Cần {payment.Amount:N0}đ nhưng chỉ nhận được {request.TransferAmount:N0}đ.");
                    return (false, "INSUFFICIENT_AMOUNT");
                }

                var isExisted = await context.Payment.AnyAsync(x => x.TransactionId.ToLower().Trim() == request.ReferenceCode.ToLower().Trim());
                if (isExisted) return (false, "DUPLICATE_TRANSACTION");

                payment.Status = "Đã đóng";
                payment.PaidAt = request.TransferDate.ToUniversalTime();
                payment.ActualAmount = request.TransferAmount;
                payment.TransactionId = request.ReferenceCode;

                if (payment.CourseId.HasValue)
                {
                    var studentId = await context.Student.AsNoTracking().Where(x => x.UserId == payment.UserId).Select(g => g.Id).FirstOrDefaultAsync();
                    if (studentId == Guid.Empty)
                    {
                        await SendPaymentNotify(userId, false, "Đã nhận tiền nhưng không tìm thấy thông tin sinh viên để mở khóa học. Vui lòng báo Admin.");
                        return (false, "NOT_FOUND_STUDENT");
                    }

                    context.EnrollCourse.Add(new EnrollCourse
                    {
                        Id = Guid.NewGuid(),
                        CourseId = payment.CourseId.Value,
                        StudentId = studentId,
                        EnrolledAt = DateTimeOffset.UtcNow
                    });
                }
                else if (payment.FeeDetailId.HasValue)
                {
                    var feeDetail = await context.FeeDetail.FirstOrDefaultAsync(x => x.Id == payment.FeeDetailId.Value);
                    if (feeDetail == null)
                    {
                        await SendPaymentNotify(userId, false, "Đã nhận tiền đóng học phí nhưng không tìm thấy chi tiết khoản phí. Vui lòng báo Admin.");
                        return (false, "NOT_FOUND_FEE_DETAIL");
                    }
                    feeDetail.AmountPaid = payment.ActualAmount;
                    feeDetail.PaidAt = DateTimeOffset.UtcNow;
                    feeDetail.Status = "Đã đóng";
                }

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                await SendPaymentNotify(userId, true, "Thanh toán thành công! Chào mừng bạn bắt đầu học.");
                return (true, "SUCCESS");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private async Task SendPaymentNotify(string userId, bool isSuccess, string msg)
        {
            // Bắn tin qua SignalR tới Group mang tên UserId
            await _hubContext.Clients.Group(userId).SendAsync("ReceivePaymentStatus", new
            {
                status = isSuccess ? "Success" : "Error",
                message = msg
            });
        }
    }
}
