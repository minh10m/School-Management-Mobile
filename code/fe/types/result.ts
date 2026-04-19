// ─── Response Types ────────────────────────────────────────────────────────────

export interface ResultItem {
  resultId: string;
  type: string;      // e.g. "TX" | "GK" | "CK"
  value: number;
  weight: number;
  term: number;
  schoolYear: number;
  studentId: string;
  studentName?: string;
  subjectId: string;
  subjectName?: string;
}

export interface DetailResult {
  type: string;
  value: number;
  weight: number;
}

/** Dành cho học sinh xem bảng điểm cá nhân (gom theo môn) */
export interface StudentResultSubject {
  subjectId: string;
  subjectName: string;
  detailResults: DetailResult[];
  average: number;
}

/** Dành cho giáo viên xem bảng điểm theo lớp */
export interface StudentResultForTeacherResponse {
  studentId: string;
  studentName: string;
  subjectResults: SubjectResult[];
}

export interface SubjectResult {
  subjectId: string;
  subjectName: string;
  average: number;
}

// ─── Query Params ──────────────────────────────────────────────────────────────

export interface GetStudentResultsParams {
  Term?: number;
  SchoolYear?: number;
}

export interface GetClassResultsParams {
  Term: number;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface CreateResultRequest {
  Type: string;
  Value: number;
  StudentId: string;
  SubjectId: string;
  Term: number;
  Weight: number;
  SchoolYear: number;
}

export interface UpdateResultPayload {
  Type: string;
  Value: number;
  Term: number;
  Weight: number;
  SchoolYear: number;
}
