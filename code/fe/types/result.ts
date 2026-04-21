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
  resultId?: string;
  type: string;
  value: number;
  weight: number;
}

/** Dành cho học sinh xem bảng điểm cá nhân (gom theo môn) */
export interface StudentResultSubject {
  subjectId: string;
  subjectName: string;
  detailResults: DetailResult[];
  average: number; // Đã đổi từ averageSubject sang average để khớp BE
}

/** Wrapper cho kết quả của một học sinh (Report) */
export interface StudentResultReport {
  subjectResults: StudentResultSubject[];
  average?: number;
  rating?: string;
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
  term?: number;
  schoolYear?: number;
}

export interface GetClassResultsParams {
  term: number;
  subjectId?: string;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface CreateResultRequest {
  type: string;
  value: number;
  studentId: string;
  subjectId: string;
  term: number;
  weight: number;
  schoolYear: number;
}

export interface UpdateResultPayload {
  type: string;
  value: number;
  term: number;
  weight: number;
  schoolYear: number;
}
