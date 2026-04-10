// ─── Response Types ────────────────────────────────────────────────────────────

export interface SubjectResponse {
  subjectId: string;
  subjectName: string;
  maxPeriod: number;
}

export interface SubjectTeacherItem {
  teacherSubjectId: string; // Required — used when creating schedule details
  teacherId: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface CreateSubjectPayload {
  subjectName: string;
  maxPeriod: number;
}

export interface UpdateSubjectPayload {
  subjectName?: string;
  maxPeriod?: number;
}

export interface AssignTeacherSubjectPayload {
  teacherId: string;
  subjectId: string;
}
