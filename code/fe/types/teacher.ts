// ─── Response Types ────────────────────────────────────────────────────────────

export interface TeacherListItem {
  teacherId: string;
  userId: string;
  fullName: string;
  subjectName: string;
}

export interface TeacherListResponse {
  items: TeacherListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface TeacherResponse {
  teacherId: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  birthday: string; // ISO date string
  subjectName: string;
}

export interface TeacherSubject {
  subjectId: string;
  subjectName: string;
}

// ─── Query Params ──────────────────────────────────────────────────────────────

export interface GetTeachersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  subjectId?: string;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface UpdateTeacherPayload {
  fullName?: string;
  email?: string;
  phone?: string;
  birthday?: string; // ISO date string
}

/** Teacher tự cập nhật (không được sửa role / tự gán môn) */
export type UpdateTeacherSelfPayload = UpdateTeacherPayload;
