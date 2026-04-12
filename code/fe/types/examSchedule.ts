// ─── Response Types ────────────────────────────────────────────────────────────

export interface ExamScheduleResponse {
  examScheduleId: string;
  title: string;
  type: string;       // e.g. "Midterm" | "Final"
  term: number;       // Changed to number to match backend
  schoolYear: number; // Changed to number to match backend
  grade: number;
  isActive: boolean;
}

export interface ExamScheduleDetailResponse {
  examScheduleDetailId: string;
  examScheduleId: string;
  teacherId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  startTime: string;   
  finishTime: string;
  date: string;        // "YYYY-MM-DD"
  roomName: string;
}

export interface ExamStudentAssignmentResponse {
  examStudentAssignmentId: string;
  studentId: string;
  studentName: string;
  identificationNumber: string;
}

// ─── Filter Types ──────────────────────────────────────────────────────────────

export interface ExamScheduleFilterRequest {
  title?: string;
  type?: string;
  term?: number;
  schoolYear?: number;
  grade?: number;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface ExamScheduleDetailFilterRequest {
  subjectName?: string;
  teacherName?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ExamStudentAssignmentFilterRequest {
  studentName?: string;
  identificationNumber?: string;
  pageNumber?: number;
  pageSize?: number;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface ExamScheduleRequest {
  title: string;
  type: string;
  term: number;
  schoolYear: number;
  grade: number;
  isActive: boolean;
}

export interface UpdateExamScheduleDetail {
  subjectId: string;
  teacherId: string;
  roomName: string;
  startTime: string;
  finishTime: string;
  date: string;
}
