// ─── Response Types ────────────────────────────────────────────────────────────

export interface TeacherListItem {
  teacherId: string;
  userId: string;
  fullName: string;
  subjectNames: string[];
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
  phoneNumber: string;
  birthday: string; // ISO date string
  address: string;
  subjectNames: string[];
}

export interface TeacherSubject {
  teacherSubjectId: string;
  subjectId: string;
  subjectName: string;
}

// ─── Query Params ──────────────────────────────────────────────────────────────

export interface GetTeachersParams {
  PageNumber?: number;
  PageSize?: number;
  FullName?: string;
  sortBy?: string;
  isAscending?: boolean;
  SubjectName?: string;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface UpdateTeacherPayload {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  birthday?: string; // YYYY-MM-DD
  address?: string;
}

export type UpdateTeacherSelfPayload = UpdateTeacherPayload;
