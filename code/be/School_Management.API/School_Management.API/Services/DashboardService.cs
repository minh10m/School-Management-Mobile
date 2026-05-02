using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace School_Management.API.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext context;

        public DashboardService(ApplicationDbContext context)
        {
            this.context = context;
        }

        public async Task<DashboardStatisticsResponse> GetAdminDashboardStatsAsync(int schoolYear)
        {
            var response = new DashboardStatisticsResponse();

            // 1. Basic Counts
            response.TotalStudents = await context.Student.CountAsync();
            response.TotalTeachers = await context.Teacher.CountAsync();
            response.TotalClasses = await context.ClassYear.Where(x => x.SchoolYear == schoolYear).CountAsync();
            response.TotalSubjects = await context.Subject.CountAsync();

            // 2. Finance Stats
            var feeDetails = await context.FeeDetail
                .Where(x => x.SchoolYear == schoolYear)
                .ToListAsync();

            response.Finance = new FinanceStats
            {
                TotalExpectedRevenue = feeDetails.Sum(x => x.AmountDue),
                TotalCollectedRevenue = feeDetails.Sum(x => x.AmountPaid),
                TotalPendingRevenue = feeDetails.Sum(x => x.AmountDue - x.AmountPaid),
                StudentsWithOverdueFees = feeDetails.Count(x => x.Status != "Paid" && x.AmountDue > x.AmountPaid)
            };

            // 3. Attendance Stats
            var attendanceData = await context.Attendance
                .Include(x => x.StudentClassYear)
                .ThenInclude(scy => scy.ClassYear)
                .Where(x => x.StudentClassYear.SchoolYear == schoolYear)
                .ToListAsync();

            if (attendanceData.Any())
            {
                var totalSessions = attendanceData.Count;
                var presentCount = attendanceData.Count(x => x.Status == "Present");
                response.Attendance = new AttendanceStats
                {
                    OverallAttendanceRate = Math.Round((double)presentCount / totalSessions * 100, 2),
                    TopAbsentClasses = attendanceData
                        .GroupBy(x => x.StudentClassYear.ClassYear.ClassName)
                        .Select(g => new ClassAttendanceDto
                        {
                            ClassName = g.Key,
                            AttendanceRate = Math.Round((double)g.Count(x => x.Status == "Present") / g.Count() * 100, 2)
                        })
                        .OrderBy(x => x.AttendanceRate)
                        .Take(5)
                        .ToList()
                };
            }
            else
            {
                response.Attendance = new AttendanceStats { OverallAttendanceRate = 0, TopAbsentClasses = new List<ClassAttendanceDto>() };
            }

            // 4. Academic Stats
            var studentAverages = await context.Result
                .Where(x => x.SchoolYear == schoolYear)
                .GroupBy(x => x.StudentId)
                .Select(g => (double)g.Average(x => x.Value))
                .ToListAsync();

            response.Academic = new AcademicStats
            {
                AssignmentCompletionRate = await CalculateCompletionRate(),
                GradeDistribution = studentAverages
                    .GroupBy(v => GetGradeLabel(v))
                    .Select(g => new GradeDistributionDto
                    {
                        GradeLabel = g.Key,
                        Count = g.Count()
                    }).ToList()
            };

            // 5. Recent Activities
            response.RecentActivities = await GetRecentActivities();

            return response;
        }

        private async Task<double> CalculateCompletionRate()
        {
            var totalSubmissions = await context.Submission.CountAsync();
            var gradedSubmissions = await context.Submission.CountAsync(x => x.Score != null);
            return totalSubmissions > 0 ? Math.Round((double)gradedSubmissions / totalSubmissions * 100, 2) : 0;
        }

        private string GetGradeLabel(double score)
        {
            if (score >= 8.5) return "Giỏi";
            if (score >= 7.0) return "Khá";
            if (score >= 5.0) return "Trung Bình";
            return "Yếu";
        }

        private async Task<List<RecentActivityDto>> GetRecentActivities()
        {
            var activities = new List<RecentActivityDto>();

            // Recent Payments
            var recentPayments = await context.Payment
                .OrderByDescending(x => x.CreatedAt)
                .Take(5)
                .Select(x => new RecentActivityDto
                {
                    Description = $"Thanh toán {x.Amount:N0} VNĐ - {x.Description}",
                    Time = x.CreatedAt.DateTime,
                    Type = "Payment"
                }).ToListAsync();
            activities.AddRange(recentPayments);

            // Recent Submissions
            var recentSubmissions = await context.Submission
                .Include(x => x.Student)
                .ThenInclude(s => s.User)
                .OrderByDescending(x => x.TimeSubmit)
                .Take(5)
                .Select(x => new RecentActivityDto
                {
                    Description = $"Bài nộp mới: {x.Student.User.FullName}",
                    Time = x.TimeSubmit.DateTime,
                    Type = "Submission"
                }).ToListAsync();
            activities.AddRange(recentSubmissions);

            return activities.OrderByDescending(x => x.Time).Take(10).ToList();
        }
    }
}
