export type SubmissionStatus = 'submitted' | 'graded' | 'late';

// ─── Response Types ────────────────────────────────────────────────────────────

/** Chi tiết bài nộp (Dùng cho Create, GetById, Grade, GetMySubmission) */
export interface SubmissionResponse {
  submissionId: string;
  fileTitle: string;
  timeSubmit: string;         // ISO datetime
  status: SubmissionStatus;
  assignmentId: string;
  fileUrl: string | null;
  studentId: string;
  score: number | null;
}

/** Dành cho giáo viên xem danh sách bài nộp của một bài tập */
export interface TeacherSubmissionListResponse {
  submissionId: string;
  fileTitle: string;
  timeSubmit: string;
  status: SubmissionStatus;
  assignmentId: string;
  fileUrl: string | null;
  studentName: string;
  score: number | null;
}

export interface TeacherSubmissionListResponseWrapper {
  items: TeacherSubmissionListResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// ─── Query Params ──────────────────────────────────────────────────────────────

export interface GetSubmissionsParams {
  assignmentId: string; // required
}

export interface GetMySubmissionParams {
  assignmentId: string;
  studentId: string;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface CreateSubmissionPayload {
  assignmentId: string;
  fileTitle: string;
  fileUrl: string | null;
}

export interface GradeSubmissionPayload {
  score: number;
}
