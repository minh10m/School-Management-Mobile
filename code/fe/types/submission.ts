export type SubmissionStatus = 'submitted' | 'graded' | 'late';

// ─── Response Types ────────────────────────────────────────────────────────────

export interface SubmissionResponse {
  subId: string;
  body: string;
  timeSubmit: string;         // ISO datetime
  status: SubmissionStatus;
  assignmentId: string;
  fileUrl: string | null;
  studentId: string;
  studentName: string;
  score: number | null;       // null = chưa chấm
  feedback: string | null;    // null = chưa nhận xét
}

/** Dành cho học sinh xem bài nộp của mình */
export interface StudentSubmissionResponse {
  subId: string;
  body: string;
  timeSubmit: string;
  status: SubmissionStatus;
  assignmentId: string;
  fileUrl: string | null;
  score: number | null;
  feedback: string | null;
}

// ─── Query Params ──────────────────────────────────────────────────────────────

export interface GetSubmissionsParams {
  assignmentId: string; // required
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface CreateSubmissionPayload {
  assignmentId: string;
  body: string;
  fileUrl?: string;
}

export interface GradeSubmissionPayload {
  score: number;
  feedback: string;
}
