import {
  AssignmentResponse,
  CreateAssignmentPayload,
  GetAssignmentsParams,
  StudentAssignmentResponse,
  TeacherAssignmentListResponse,
  UpdateAssignmentPayload,
} from "../types/assignment";
import apiClient from "./apiClient";

export const assignmentService = {
  // ─── TEACHER: LIST ────────────────────────────────────────────────────────────
  /**
   * Teacher retrieves a list of assignments by their assigned class and subject.
   * GET /assignments?classYearId=&teacherSubjectId=
   * System automatically sorts by startTime descending (ASC).
   * AuthN(login) + AuthZ(Teacher)
   */
  getAssignments: async (params: GetAssignmentsParams): Promise<TeacherAssignmentListResponse[]> => {
    const response = await apiClient.get<any>("/assignments", { params });
    // Backend returns PagedResponse<AssignmentListResponse> which has an Items property
    return response.data.items || [];
  },

  // ─── TEACHER: GET ONE ─────────────────────────────────────────────────────────
  /**
   * Teacher retrieves detailed information for a specific assignment.
   * GET /assignments/{id}
   * AuthN(login) + AuthZ(Teacher)
   */
  getAssignmentById: async (id: string): Promise<AssignmentResponse> => {
    const response = await apiClient.get<AssignmentResponse>(`/assignments/${id}`);
    return response.data;
  },

  getMyAssignments: async (params?: GetAssignmentsParams): Promise<StudentAssignmentResponse[]> => {
    const response = await apiClient.get<any>("/assignments/my", { params });
    // Handle both { items: [] } and raw array formats from the backend
    const data = response.data;
    return Array.isArray(data) ? data : data?.items || [];
  },

  // ─── TEACHER: CREATE ──────────────────────────────────────────────────────────
  /**
   * Teacher creates a new assignment for a class.
   * POST /assignments
   * AuthN(login) + AuthZ(Teacher)
   * Supports both JSON and FormData (for file uploads)
   */
  createAssignment: async (payload: CreateAssignmentPayload | FormData): Promise<AssignmentResponse> => {
    const headers = payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
    const response = await apiClient.post<AssignmentResponse>("/assignments", payload, { headers });
    return response.data;
  },

  // ─── TEACHER: UPDATE ──────────────────────────────────────────────────────────
  /**
   * Teacher updates assignment information (only creator can edit).
   * PATCH /assignments/{id}
   * Supports both JSON and FormData
   */
  updateAssignment: async (
    id: string,
    payload: UpdateAssignmentPayload | FormData
  ): Promise<AssignmentResponse> => {
    const headers = payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
    const response = await apiClient.patch<AssignmentResponse>(`/assignments/${id}`, payload, { headers });
    return response.data;
  },

  // ─── TEACHER: DELETE ──────────────────────────────────────────────────────────
  /**
   * Teacher deletes an assignment.
   * DELETE /assignments/{id}
   * AuthN(login) + AuthZ(Teacher)
   */
  deleteAssignment: async (id: string): Promise<void> => {
    await apiClient.delete(`/assignments/${id}`);
  },
};
