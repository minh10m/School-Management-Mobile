// ─── Response Types ────────────────────────────────────────────────────────────

export interface ClassYearResponse {
  classYearId: string;
  className: string;
  grade: number;
  schoolYear: number;
  homeRoomTeacher: string;  // teacher fullName
  homeRoomId: string;
  homeRoomName: string | null;
  studentCount: number;
}

/** Dùng cho /teaching và /by-teacher (ít thông tin hơn) */
export interface ClassYearSummary {
  classYearId: string;
  className: string;
  grade: number;
  schoolYear: number;
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
  className?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface CreateClassYearPayload {
  className: string;
  grade: number;
  schoolYear: number;
  homeRoomId: string; // teacherId của giáo viên chủ nhiệm
}

export interface UpdateClassYearPayload {
  className?: string;
  grade?: number;
  schoolYear?: number;
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
