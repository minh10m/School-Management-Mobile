export type AttendanceStatus = 'present' | 'absent' | 'late';

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

// ─── Query Params ──────────────────────────────────────────────────────────────

export interface GetClassAttendanceParams {
  classYearId: string; // required
  date: string;        // required, "YYYY-MM-DD"
}

export interface GetStudentAttendanceParams {
  month?: number; // 1-12
  year?: number;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface AttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface SubmitAttendancePayload {
  classYearId: string;
  date: string; // "YYYY-MM-DD"
  attendances: AttendanceEntry[];
}
