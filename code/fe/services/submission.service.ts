import {
  CreateSubmissionPayload,
  GetSubmissionsParams,
  GradeSubmissionPayload,
  StudentSubmissionResponse,
  SubmissionResponse,
} from "../types/submission";
import apiClient from "./apiClient";

export const submissionService = {
  // ─── TEACHER: LIST SUBMISSIONS BY ASSIGNMENT ──────────────────────────────────
  /**
   * Giáo viên lấy danh sách bài nộp theo bài tập
   * GET /submissions?assignmentId={id}
   * AuthN(login) + AuthZ(Teacher)
   * 404: bài tập không tồn tại
   */
  getSubmissionsByAssignment: async (
    params: GetSubmissionsParams
  ): Promise<SubmissionResponse[]> => {
    const response = await apiClient.get<SubmissionResponse[]>("/submissions", { params });
    return response.data;
  },

  // ─── TEACHER: GET ONE ────────────────────────────────────────────────────────
  /**
   * Giáo viên lấy thông tin chi tiết một bài nộp
   * GET /submissions/{id}
   * AuthN(login) + AuthZ(Teacher)
   * 404: bài nộp không tồn tại
   */
  getSubmissionById: async (submissionId: string): Promise<SubmissionResponse> => {
    const response = await apiClient.get<SubmissionResponse>(`/submissions/${submissionId}`);
    return response.data;
  },

  // ─── TEACHER: GRADE ──────────────────────────────────────────────────────────
  /**
   * Giáo viên chấm điểm và nhận xét bài nộp
   * PATCH /submissions/{id}/score
   * AuthN(login) + AuthZ(Teacher)
   * 404: bài nộp không tồn tại
   */
  gradeSubmission: async (
    submissionId: string,
    payload: GradeSubmissionPayload
  ): Promise<SubmissionResponse> => {
    const response = await apiClient.patch<SubmissionResponse>(
      `/submissions/${submissionId}/score`,
      payload
    );
    return response.data;
  },

  // ─── STUDENT: SUBMIT ─────────────────────────────────────────────────────────
  /**
   * Học sinh nộp bài tập
   * POST /submissions
   * AuthN(login) + AuthZ(Student)
   * 404: bài tập không tồn tại
   * 409: đã nộp rồi hoặc quá hạn nộp
   */
  submitAssignment: async (
    payload: CreateSubmissionPayload
  ): Promise<StudentSubmissionResponse> => {
    const response = await apiClient.post<StudentSubmissionResponse>("/submissions", payload);
    return response.data;
  },

  // ─── STUDENT: GET MY SUBMISSION ───────────────────────────────────────────────
  /**
   * Học sinh xem bài nộp của mình theo bài tập
   * GET /submissions?assignmentId={id}  (AuthZ: Student)
   * AuthN(login) + AuthZ(Student)
   * 404: bài tập không tồn tại
   */
  getMySubmission: async (
    params: GetSubmissionsParams
  ): Promise<StudentSubmissionResponse[]> => {
    const response = await apiClient.get<StudentSubmissionResponse[]>("/submissions", {
      params,
    });
    return response.data;
  },
};
