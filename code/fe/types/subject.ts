// ─── Response Types ────────────────────────────────────────────────────────────

export interface SubjectResponse {
  subjectId: string;
  subjectName: string;
}

export interface SubjectTeacherItem {
  teacherId: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface CreateSubjectPayload {
  subjectName: string;
}

export interface UpdateSubjectPayload {
  subjectName: string;
}
