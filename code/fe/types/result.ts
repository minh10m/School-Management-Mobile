// ─── Response Types ────────────────────────────────────────────────────────────

export interface ResultItem {
  resultId: string;
  type: string;      // e.g. "TX" | "GK" | "CK"
  value: number;
  weight: number;
  term: string;
  schoolYear: string;
  studentId: string;
  subjectId: string;
}

/** Dành cho học sinh xem bảng điểm cá nhân (gom theo môn) */
export interface StudentResultSubject {
  subjectId: string;
  subjectName: string;
  scores: ResultItem[];
  average: number;
}

/** Dành cho giáo viên xem bảng điểm theo lớp */
export interface ClassResultItem extends ResultItem {
  studentName: string;
  subjectName: string;
  average: number;
}

// ─── Query Params ──────────────────────────────────────────────────────────────

export interface GetStudentResultsParams {
  term?: string;
  schoolYear?: string;
}

export interface GetClassResultsParams {
  classYearId: string;
  subjectId: string;
  term: string;
  schoolYear: string;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface CreateResultEntry {
  type: string;
  value: number;
  studentId: string;
  subjectId: string;
  term: string;
  weight: number;
  schoolYear: string;
}

export interface UpdateResultPayload {
  type?: string;
  value?: number;
  term?: string;
  weight?: number;
  schoolYear?: string;
}
