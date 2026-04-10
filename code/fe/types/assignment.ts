// ─── Response Types ────────────────────────────────────────────────────────────

export interface TeacherAssignmentListResponse {
  assignmentId: string;
  title: string;
  fileTitle: string | null;
  fileUrl: string | null;
  startTime: string; // ISO datetime
  finishTime: string; // ISO datetime
}

/** Chi tiết bài tập (Dùng cho Create, Update, GetById cho giáo viên) */
export interface AssignmentResponse {
  assignmentId: string;
  title: string;
  fileUrl: string | null;
  fileTitle: string | null;
  startTime: string; // ISO datetime
  finishTime: string; // ISO datetime
  teacherSubjectId: string;
  teacherName: string;
  subjectName: string;
  classYearId: string;
  className: string;
  body?: string; // Mô tả chi tiết (nếu có)
}

export interface StudentAssignmentResponse {
  assignmentId: string;
  title: string;
  body: string | null;
  fileUrl: string | null;
  startTime: string;
  finishTime: string;
  teacherSubjectId: string;
  teacherName: string;
  subjectName: string;
  className: string;
  classYearId: string;
  status: string | null;
}

// ─── Query Params ──────────────────────────────────────────────────────────────

export interface GetAssignmentsParams {
  classYearId?: string;
  teacherSubjectId?: string;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface CreateAssignmentPayload {
  title: string;
  fileUrl?: string | null;
  fileTitle?: string | null;
  startTime: string; // ISO datetime
  finishTime: string; // ISO datetime
  subjectId: string;
  classYearId: string;
  body?: string; // Mô tả chi tiết (nếu có)
}

/**
 * Khi sửa bài tập, KHÔNG ĐƯỢC sửa classYearId (lớp) vì bài tập đã cố định trong lớp.
 */
export interface UpdateAssignmentPayload {
  title?: string;
  fileUrl?: string | null;
  fileTitle?: string | null;
  startTime?: string;
  finishTime?: string;
  subjectId?: string;
  body?: string;
}
