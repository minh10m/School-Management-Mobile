// ─── Response Types ────────────────────────────────────────────────────────────

export interface ClassYearResponse {
  classYearId: string;
  className: string;
  grade: number;
  schoolYear: string;       // e.g. "2025-2026"
  homeRoomTeacher: string;  // teacher fullName
  homeRoomId?: string;
  studentCount: number;
}

/** Dùng cho /teaching và /by-teacher (ít thông tin hơn) */
export interface ClassYearSummary {
  classYearId: string;
  className: string;
  grade: number;
  schoolYear: string;
}

export interface ClassYearListResponse {
  items: ClassYearResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ─── Query Params ──────────────────────────────────────────────────────────────

export interface GetClassYearsParams {
  schoolYear?: string; // "2025-2026"
  grade?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface CreateClassYearPayload {
  className: string;
  grade: number;
  schoolYear: string;
  homeRoomId: string; // teacherId của giáo viên chủ nhiệm
}

export interface UpdateClassYearPayload {
  className?: string;
  grade?: number;
  schoolYear?: string;
  homeRoomId?: string;
}

/** Gán học sinh vào lớp */
export interface AssignStudentPayload {
  studentId: string;
}

/** Promote học sinh từ lớp cũ lên lớp mới */
export interface PromoteClassPair {
  fromClassYearId: string;
  toClassYearId: string;
}

export interface ClassPromoteRequest {
  currentSystemYear: number;
  classPromotes: PromoteClassPair[];
}
