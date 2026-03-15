import {
  AssignmentResponse,
  CreateAssignmentPayload,
  GetAssignmentsParams,
  StudentAssignmentResponse,
  UpdateAssignmentPayload,
} from "../types/assignment";
import apiClient from "./apiClient";

export const assignmentService = {
  // ─── TEACHER: LIST ────────────────────────────────────────────────────────────
  /**
   * Giáo viên lấy danh sách bài tập theo lớp và môn
   * GET /assignments?classYearId=&teacherSubjectId=
   * AuthN(login) + AuthZ(Teacher)
   * 404: teacherSubjectId hoặc classYearId không tồn tại
   */
  getAssignments: async (params: GetAssignmentsParams): Promise<AssignmentResponse[]> => {
    const response = await apiClient.get<AssignmentResponse[]>("/assignments", { params });
    return response.data;
  },

  // ─── TEACHER: GET ONE ─────────────────────────────────────────────────────────
  /**
   * Giáo viên lấy thông tin bài tập theo id
   * GET /assignments/{id}
   * AuthN(login) + AuthZ(Teacher)
   * 404: bài tập không tồn tại
   */
  getAssignmentById: async (assignmentId: string): Promise<AssignmentResponse> => {
    const response = await apiClient.get<AssignmentResponse>(`/assignments/${assignmentId}`);
    return response.data;
  },

  // ─── STUDENT: GET MY ASSIGNMENTS ──────────────────────────────────────────────
  /**
   * Học sinh xem bài tập của lớp mình (có kèm trạng thái đã nộp chưa)
   * null submission = chưa nộp
   * GET /assignments/my
   * AuthN(login) + AuthZ(Student)
   */
  getMyAssignments: async (): Promise<StudentAssignmentResponse[]> => {
    const response = await apiClient.get<StudentAssignmentResponse[]>("/assignments/my");
    return response.data;
  },

  // ─── TEACHER: CREATE ──────────────────────────────────────────────────────────
  /**
   * Giáo viên tạo bài tập mới
   * POST /assignments
   * AuthN(login) + AuthZ(Teacher)
   * 403: teacher không được phép dạy môn này
   * 404: teacherSubjectId hoặc classYearId không tồn tại
   */
  createAssignment: async (payload: CreateAssignmentPayload): Promise<AssignmentResponse> => {
    const response = await apiClient.post<AssignmentResponse>("/assignments", payload);
    return response.data;
  },

  // ─── TEACHER: UPDATE ──────────────────────────────────────────────────────────
  /**
   * Giáo viên sửa thông tin bài tập (chỉ người tạo mới được sửa)
   * PATCH /assignments/{id}
   * AuthN(login) + AuthZ(Teacher)
   * 403: không phải giáo viên đã tạo bài tập
   * 404: bài tập / teacherSubjectId / classYearId không tồn tại
   */
  updateAssignment: async (
    assignmentId: string,
    payload: UpdateAssignmentPayload
  ): Promise<AssignmentResponse> => {
    const response = await apiClient.patch<AssignmentResponse>(
      `/assignments/${assignmentId}`,
      payload
    );
    return response.data;
  },

  // ─── TEACHER: DELETE ──────────────────────────────────────────────────────────
  /**
   * Giáo viên xóa bài tập
   * DELETE /assignments/{id}
   * AuthN(login) + AuthZ(Teacher)
   */
  deleteAssignment: async (assignmentId: string): Promise<void> => {
    await apiClient.delete(`/assignments/${assignmentId}`);
  },
};
