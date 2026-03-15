// ─── Response Types ────────────────────────────────────────────────────────────

export interface ExamScheduleResponse {
  examScheduleId: string;
  type: string;       // e.g. "Midterm" | "Final"
  term: string;       // e.g. "HK1"
  schoolYear: string; // e.g. "2025-2026"
  grade: number;
}

export interface ExamScheduleDetailResponse {
  examScheduleDetailId: string;
  examScheduleId: string;
  teacherId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  startTime: string;   // ISO datetime
  finishTime: string;
  date: string;        // "YYYY-MM-DD"
  roomName: string;
}

// ─── Query Params ──────────────────────────────────────────────────────────────

export interface GetExamSchedulesParams {
  grade?: number;
  schoolYear?: string;
  term?: string;
  teacherId?: string; // dành cho giáo viên lọc lịch coi thi
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface CreateExamSchedulePayload {
  type: string;
  term: string;
  schoolYear: string;
  grade: number;
}

export interface UpdateExamSchedulePayload {
  type?: string;
  term?: string;
  schoolYear?: string;
  grade?: number;
}

export interface CreateExamScheduleDetailPayload {
  teacherId: string;
  subjectId: string;
  startTime: string;
  finishTime: string;
  date: string;        // "YYYY-MM-DD"
  roomName: string;
}

export interface UpdateExamScheduleDetailPayload {
  teacherId?: string;
  subjectId?: string;
  startTime?: string;
  finishTime?: string;
  date?: string;
  roomName?: string;
}
