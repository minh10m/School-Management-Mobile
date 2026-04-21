import { SubmissionFilterParams, SubmissionResponse, ScoreSubmissionRequest, SubmissionCreateRequest, SubmissionStudentRequest } from "../types/submission";
import apiClient from "./apiClient";

export const submissionService = {
  /**
   * Teachers get all submissions for a specific assignment.
   * GET /api/submissions?assignmentId=xxx
   */
  getSubmissions: async (params: SubmissionFilterParams): Promise<SubmissionResponse[]> => {
    const response = await apiClient.get<any>("/submissions", { params });
    // Backend returns PagedResponse<SubmissionResponse> which has an items property
    return response.data.items || [];
  },

  /**
   * Get a single submission detail.
   * GET /api/submissions/{id}
   */
  getSubmissionById: async (submissionId: string): Promise<SubmissionResponse> => {
    const response = await apiClient.get<SubmissionResponse>(`/submissions/${submissionId}`);
    return response.data;
  },

  /**
   * Teachers score a student submission.
   * PATCH /api/submissions/{id}/score
   */
  scoreSubmission: async (submissionId: string, score: number): Promise<any> => {
    const payload: ScoreSubmissionRequest = { score };
    const response = await apiClient.patch(`/submissions/${submissionId}/score`, payload);
    return response.data;
  },

  /**
   * Students submit their homework.
   * POST /api/submissions
   * Supports both JSON and FormData (for actual file uploads)
   */
  submitAssignment: async (payload: SubmissionCreateRequest | FormData): Promise<any> => {
    const headers = payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
    const response = await apiClient.post("/submissions", payload, { headers });
    return response.data;
  },

  /**
   * Students get their own submission for a specific assignment.
   * GET /api/submissions/mySubmission?assignmentId=xxx
   */
  getMySubmission: async (params: SubmissionStudentRequest): Promise<SubmissionResponse | null> => {
    const response = await apiClient.get<{ success: boolean; data: SubmissionResponse }>("/submissions/mySubmission", { params });
    return response.data.data;
  }
};
