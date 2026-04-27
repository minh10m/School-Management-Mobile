using Azure.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using School_Management.API.Data;
using School_Management.API.Models.DTO;
using System.ComponentModel;

namespace School_Management.API.Repositories
{
    public class StudentPlugin
    {
        private readonly string role;
        private readonly Guid userId;
        private readonly ApplicationDbContext context;

        public StudentPlugin(string role, Guid userId, ApplicationDbContext context)
        {
            this.role = role;
            this.userId = userId;
            this.context = context;
        }

        [KernelFunction]
        [Description("Lấy danh sách lịch thi chi tiết cho học sinh. Yêu cầu đầy đủ loại lịch, học kỳ và năm học.")]
        public async Task<List<MyExamScheduleDetailResponse>> GetMyExamSchedule(
                    [Description("Loại lịch thi (Giữa kì hoặc Cuối kì). Bắt buộc phải có.")]
                    string Type = "",

                    [Description("Học kỳ (1 hoặc 2). Bắt buộc phải có.")]
                    int? Term = null,

                    [Description("Năm học bắt đầu (ví dụ: 2024). Bắt buộc phải có.")]
                    int? SchoolYear = null
        )
        {
            if (string.IsNullOrEmpty(Type) || Term == null || SchoolYear == null)
            {
                return new List<MyExamScheduleDetailResponse>(); // AI sẽ tự hỏi lại dựa trên System Prompt
            }

            var studentId = await context.Student.AsNoTracking()
                                 .Where(x => x.UserId == userId)
                                 .Select(g => g.Id)
                                 .FirstOrDefaultAsync();

            if (studentId == Guid.Empty) return new List<MyExamScheduleDetailResponse>();

            var grade = await context.StudentClassYear.AsNoTracking()
                                      .Where(x => x.StudentId == studentId && x.ClassYear.SchoolYear == SchoolYear)
                                      .Select(g => g.ClassYear.Grade)
                                      .FirstOrDefaultAsync();

            var listResult = await context.ExamStudentAssignment.AsNoTracking()
                .Where(x => x.ExamScheduleDetail.ExamSchedule.Type == Type &&
                            x.ExamScheduleDetail.ExamSchedule.Term == Term &&
                            x.ExamScheduleDetail.ExamSchedule.SchoolYear == SchoolYear &&
                            x.ExamScheduleDetail.ExamSchedule.IsActive == true &&
                            x.ExamScheduleDetail.ExamSchedule.Grade == grade &&
                            x.StudentId == studentId)
                .OrderBy(x => x.ExamScheduleDetail.Date)
                .ThenBy(x => x.ExamScheduleDetail.StartTime)
                .Select(g => new MyExamScheduleDetailResponse
                {
                    StartTime = g.ExamScheduleDetail.StartTime,
                    Date = g.ExamScheduleDetail.Date,
                    ExamScheduleDetailId = g.ExamScheduleDetail.Id,
                    ExamScheduleId = g.ExamScheduleDetail.ExamScheduleId,
                    FinishTime = g.ExamScheduleDetail.FinishTime,
                    RoomName = g.ExamScheduleDetail.RoomName,
                    SubjectId = g.ExamScheduleDetail.SubjectId,
                    SubjectName = g.ExamScheduleDetail.Subject.SubjectName,
                    // Sử dụng toán tử an toàn
                    TeacherId = g.ExamScheduleDetail.TeacherId ?? Guid.Empty,
                    TeacherName = g.ExamScheduleDetail.Teacher.User.FullName ?? "Chưa sắp xếp",
                    IdentificationNumber = g.IdentificationNumber
                }).ToListAsync();

            return listResult;
        }

        [KernelFunction]
        [Description("Lấy danh sách học phí và lệ phí liên quan của học sinh đang chat. Yêu cầu cung cấp năm học.")]
        public async Task<List<FeeDetailResponse>> GetAllMyFeeForStudent
        (
            [Description("Năm học bắt đầu (ví dụ: 2024). Bắt buộc phải có.")]
            int? SchoolYear = null
        )
        {
            var studentInfo = await context.Student.AsNoTracking().Where(x => x.UserId == userId).Select(g => new { g.Id, g.User.FullName }).FirstOrDefaultAsync();
            if (studentInfo == null) return new List<FeeDetailResponse>();

            var query = context.FeeDetail.AsNoTracking().Where(x => x.StudentId == studentInfo.Id && x.SchoolYear == SchoolYear).AsQueryable();

            query = query.OrderBy(x => x.Id);
            var listResult = await query.Take(50)
                                        .Select(feeDetail => new FeeDetailResponse
                                        {
                                            Id = feeDetail.Id,
                                            AmountDue = feeDetail.AmountDue,
                                            AmountPaid = feeDetail.AmountPaid,
                                            FeeId = feeDetail.FeeId,
                                            PaidAt = feeDetail.PaidAt,
                                            Reason = feeDetail.Reason,
                                            SchoolYear = feeDetail.SchoolYear,
                                            Status = feeDetail.Status,
                                            StudentId = feeDetail.StudentId,
                                            StudentName = studentInfo.FullName
                                        }).ToListAsync();

            return listResult;
        }

    }
}
