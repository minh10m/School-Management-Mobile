// ─── Response Types ────────────────────────────────────────────────────────────

export interface TeacherSubjectResponse {
  teacherSubjectId: string;
  teacherId: string;
  subjectId: string;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface AssignSubjectPayload {
  teacherId: string;
  subjectId: string;
}

export interface UpdateTeacherSubjectPayload {
  teacherId: string;
  subjectId: string;
}
