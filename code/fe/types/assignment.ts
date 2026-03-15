// ─── Response Types ────────────────────────────────────────────────────────────

/** Dùng cho giáo viên xem bài tập */
export interface AssignmentResponse {
  assignmentId: string;
  title: string;
  body: string;
  fileUrl: string | null;
  startTime: string;   // ISO datetime
  finishTime: string;  // ISO datetime
  teacherSubjectId: string;
  classYearId: string;
}

/** Dùng cho học sinh xem bài tập (có thêm thông tin giáo viên, môn, lớp) */
export interface StudentAssignmentResponse extends AssignmentResponse {
  teacherName: string;
  subjectName: string;
  className: string;
  /** null = chưa nộp, object = đã nộp (left join submission) */
  submission: {
    submissionId: string;
    status: string;
    timeSubmit: string;
  } | null;
}

// ─── Query Params ──────────────────────────────────────────────────────────────

export interface GetAssignmentsParams {
  classYearId?: string;
  teacherSubjectId?: string;
  page?: number;
  pageSize?: number;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface CreateAssignmentPayload {
  title: string;
  body: string;
  fileUrl?: string;
  startTime: string;          // ISO datetime
  finishTime: string;         // ISO datetime
  teacherSubjectId: string;
  classYearId: string;
}

export interface UpdateAssignmentPayload {
  title?: string;
  body?: string;
  fileUrl?: string;
  startTime?: string;
  finishTime?: string;
  teacherSubjectId?: string;
  classYearId?: string;
}
