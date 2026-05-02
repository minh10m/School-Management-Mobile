export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  finance: FinanceStats;
  attendance: AttendanceStats;
  academic: AcademicStats;
  recentActivities: RecentActivity[];
}

export interface FinanceStats {
  totalExpectedRevenue: number;
  totalCollectedRevenue: number;
  totalPendingRevenue: number;
  studentsWithOverdueFees: number;
}

export interface AttendanceStats {
  overallAttendanceRate: number;
  topAbsentClasses: ClassAttendance[];
}

export interface AcademicStats {
  assignmentCompletionRate: number;
  gradeDistribution: GradeDistribution[];
}

export interface ClassAttendance {
  className: string;
  attendanceRate: number;
}

export interface GradeDistribution {
  gradeLabel: string;
  count: number;
}

export interface RecentActivity {
  description: string;
  time: string;
  type: "Payment" | "Submission" | "Assignment" | "Event" | string;
}
