import {
  CreateSubmissionPayload,
  GetMySubmissionParams,
  GetSubmissionsParams,
  GradeSubmissionPayload,
  SubmissionResponse,
  TeacherSubmissionListResponse,
} from "../types/submission";
import apiClient from "./apiClient";

export const submissionService = {
  // ─── STUDENT: SUBMIT ─────────────────────────────────────────────────────────
  /**
   * Student submits an assignment. They can still submit past the deadline, but it will be marked as late.
   * POST /submissions
   * AuthN(login) + AuthZ(Student)
   * 409: Already submitted or deadline significantly passed
   */
  submitAssignment: async (payload: CreateSubmissionPayload): Promise<SubmissionResponse> => {
    const response = await apiClient.post<SubmissionResponse>("/submissions", payload);
    return response.data;
  },

  // ─── TEACHER: LIST SUBMISSIONS ────────────────────────────────────────────────
  /**
   * Teacher retrieves a list of submissions for a specific assignment.
   * GET /submissions?assignmentId={id}
   * AuthN(login) + AuthZ(Teacher)
   */
  getSubmissionsByAssignment: async (
    params: GetSubmissionsParams
  ): Promise<TeacherSubmissionListResponse[]> => {
    const response = await apiClient.get<TeacherSubmissionListResponse[]>("/submissions", { params });
    return response.data;
  },

  // ─── TEACHER: GET ONE ────────────────────────────────────────────────────────
  /**
   * Teacher retrieves detailed information for a specific submission.
   * GET /submissions/{id}
   * AuthN(login) + AuthZ(Teacher)
   */
  getSubmissionById: async (id: string): Promise<SubmissionResponse> => {
    const response = await apiClient.get<SubmissionResponse>(`/submissions/${id}`);
    return response.data;
  },

  // ─── TEACHER: GRADE ──────────────────────────────────────────────────────────
  /**
   * Teacher grades and adds feedback to a submission.
   * PATCH /submissions/{id}/score
   * AuthN(login) + AuthZ(Teacher)
   */
  gradeSubmission: async (
    id: string,
    payload: GradeSubmissionPayload
  ): Promise<SubmissionResponse> => {
    const response = await apiClient.patch<SubmissionResponse>(
      `/submissions/${id}/score`,
      payload
    );
    return response.data;
  },

  // ─── STUDENT: GET MY SUBMISSION ───────────────────────────────────────────────
  /**
   * Student retrieves their submission for a specific assignment.
   * GET /submissions/mySubmission?assignmentId=&studentId=
   * AuthN(login) + AuthZ(Student)
   */
  getMySubmission: async (params: GetMySubmissionParams): Promise<SubmissionResponse> => {
    const response = await apiClient.get<SubmissionResponse>("/submissions/mySubmission", {
      params,
    });
    return response.data;
  },
};
