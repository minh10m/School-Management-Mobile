import {
  GetTeachersParams,
  TeacherListResponse,
  TeacherResponse,
  TeacherSubject,
  UpdateTeacherPayload,
  UpdateTeacherSelfPayload,
} from "../types/teacher";
import apiClient from "./apiClient";

export const teacherService = {
  // ─── LIST ─────────────────────────────────────────────────────────────────────
  /**
   * Lấy danh sách giáo viên (phân trang, sort, filter, search)
   * GET /teachers
   * AuthN(login)
   */
  getTeachers: async (params?: GetTeachersParams): Promise<TeacherListResponse> => {
    const response = await apiClient.get<TeacherListResponse>("/teachers", { params });
    return response.data;
  },

  // ─── GET ONE ──────────────────────────────────────────────────────────────────
  /**
   * Lấy chi tiết thông tin giáo viên
   * GET /teachers/{id}
   * AuthN(login)
   * 404: giáo viên không tồn tại
   */
  getTeacherById: async (teacherId: string): Promise<TeacherResponse> => {
    const response = await apiClient.get<TeacherResponse>(`/teachers/${teacherId}`);
    return response.data;
  },

  // ─── GET ME ───────────────────────────────────────────────────────────────────
  /**
   * Giáo viên xem profile bản thân
   * GET /teachers/me
   * AuthN(login) + AuthZ(Teacher)
   */
  getMe: async (): Promise<TeacherResponse> => {
    const response = await apiClient.get<TeacherResponse>("/teachers/me");
    return response.data;
  },

  // ─── GET SUBJECTS ─────────────────────────────────────────────────────────────
  /**
   * Lấy danh sách môn học mà giáo viên đang dạy
   * GET /teachers/{id}/subjects
   * AuthN(login)
   * 404: giáo viên không tồn tại
   */
  getTeacherSubjects: async (teacherId: string): Promise<TeacherSubject[]> => {
    const response = await apiClient.get<TeacherSubject[]>(`/teachers/${teacherId}/subjects`);
    return response.data;
  },

  // ─── UPDATE (Admin cập nhật giáo viên) ──────────────────────────────────────
  /**
   * Admin chỉnh sửa thông tin giáo viên
   * (Gán môn dùng API khác)
   * PATCH /teachers/{id}
   * AuthN(login) + AuthZ(Admin)
   * 404: giáo viên không tồn tại
   */
  updateTeacher: async (
    teacherId: string,
    payload: UpdateTeacherPayload
  ): Promise<TeacherResponse> => {
    const response = await apiClient.patch<TeacherResponse>(
      `/teachers/${teacherId}`,
      payload
    );
    return response.data;
  },

  // ─── UPDATE ME (Giáo viên tự cập nhật) ──────────────────────────────────────
  /**
   * Giáo viên tự sửa thông tin bản thân
   * (không được tự đổi role hoặc tự gán môn)
   * PATCH /teachers/me
   * AuthN(login) + AuthZ(Teacher)
   */
  updateMe: async (payload: UpdateTeacherSelfPayload): Promise<TeacherResponse> => {
    const response = await apiClient.patch<TeacherResponse>("/teachers/me", payload);
    return response.data;
  },
};
