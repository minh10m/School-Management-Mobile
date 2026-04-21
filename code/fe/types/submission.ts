export interface SubmissionResponse {
  submissionId: string;
  timeSubmit: string;
  status: string | null;
  assignmentId: string;
  fileTitle: string;
  fileUrl: string;
  studentId: string;
  studentName: string;
  score: number | null;
}

export interface SubmissionFilterParams {
  Status?: string;
  FileTitle?: string;
  AssignmentId: string;
  PageNumber?: number;
  PageSize?: number;
}

export interface ScoreSubmissionRequest {
  score: number;
}

export interface SubmissionCreateRequest {
  assignmentId: string;
  fileUrl: string;
  fileTitle: string;
}

export interface SubmissionCreatePayload {
  AssignmentId: string;
  File: any; // Used for multipart/form-data
  FileTitle: string;
}

export interface SubmissionStudentRequest {
  assignmentId: string;
}
