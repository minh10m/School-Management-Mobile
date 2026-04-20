export type AttendanceStatus = 'present' | 'absent' | 'late' | 'Có mặt' | 'Vắng mặt' | 'Đi trễ';

// ─── Response Types ────────────────────────────────────────────────────────────

/** Phần tử trong danh sách điểm danh lớp (cho giáo viên) */
export interface ClassAttendanceItem {
  studentId: string;
  studentName: string;
  attendanceId: string | null; // null nếu chưa điểm danh
  status: AttendanceStatus | null;
  note: string | null;
}

/** Response sau khi gọi POST điểm danh */
export interface SubmitAttendanceResponse {
  date: string;         // "YYYY-MM-DD"
  classYearId: string;
  updatedCount: number;
}

/** Phần tử lịch sử điểm danh của học sinh (theo tháng/năm) */
export interface StudentAttendanceRecord {
  date: string;                // "YYYY-MM-DD"
  status: AttendanceStatus;
  note: string;
}

/** Response đầy đủ từ GET /attendances/student/me */
export interface StudentAttendanceResponse {
  totalPresent: number;
  totalAbsent: number;
  percentage: number;
  studentAttendances: StudentAttendanceRecord[];
}

// ─── Query Params ──────────────────────────────────────────────────────────────

export interface GetClassAttendanceParams {
  classYearId: string; // required
  date: string;        // required, "YYYY-MM-DD"
}

export interface GetStudentAttendanceParams {
  month?: number; // 1-12
  year?: number;
}

export interface GetWeeklyAttendanceParams {
  classYearId: string;
  startDate: string; // "YYYY-MM-DD"
}

export interface WeeklyAttendanceResponse {
  studentId: string;
  studentName: string;
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  details: StudentAttendanceRecord[];
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface AttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
  note?: string | null;
}

export interface SubmitAttendancePayload {
  classYearId: string;
  date: string; // "YYYY-MM-DD"
  attendances: AttendanceEntry[];
}
