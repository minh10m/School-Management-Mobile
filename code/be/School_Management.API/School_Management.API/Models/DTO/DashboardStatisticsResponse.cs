using System;
using System.Collections.Generic;

namespace School_Management.API.Models.DTO
{
    public class DashboardStatisticsResponse
    {
        public int TotalStudents { get; set; }
        public int TotalTeachers { get; set; }
        public int TotalClasses { get; set; }
        public int TotalSubjects { get; set; }
        
        public FinanceStats Finance { get; set; }
        public AttendanceStats Attendance { get; set; }
        public AcademicStats Academic { get; set; }
        public List<RecentActivityDto> RecentActivities { get; set; }
    }

    public class FinanceStats
    {
        public decimal TotalExpectedRevenue { get; set; }
        public decimal TotalCollectedRevenue { get; set; }
        public decimal TotalPendingRevenue { get; set; }
        public int StudentsWithOverdueFees { get; set; }
    }

    public class AttendanceStats
    {
        public double OverallAttendanceRate { get; set; }
        public List<ClassAttendanceDto> TopAbsentClasses { get; set; }
    }

    public class AcademicStats
    {
        public double AssignmentCompletionRate { get; set; }
        public List<GradeDistributionDto> GradeDistribution { get; set; }
    }

    public class ClassAttendanceDto
    {
        public string ClassName { get; set; }
        public double AttendanceRate { get; set; }
    }

    public class GradeDistributionDto
    {
        public string GradeLabel { get; set; } // Giỏi, Khá, Trung Bình, Yếu
        public int Count { get; set; }
    }

    public class RecentActivityDto
    {
        public string Description { get; set; }
        public DateTime Time { get; set; }
        public string Type { get; set; } // Assignment, Payment, Event, etc.
    }
}
