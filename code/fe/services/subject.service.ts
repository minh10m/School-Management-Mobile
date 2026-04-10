import {
  CreateSubjectPayload,
  SubjectResponse,
  SubjectTeacherItem,
  UpdateSubjectPayload,
} from "../types/subject";
import apiClient from "./apiClient";

export const subjectService = {
  // ─── LIST ─────────────────────────────────────────────────────────────────────
  /**
   * Lấy danh sách môn học
   * GET /subjects
   * AuthN(login) + AuthZ(Admin)
   */
  getSubjects: async (): Promise<SubjectResponse[]> => {
    const response = await apiClient.get<SubjectResponse[]>("/subjects");
    return response.data;
  },

  // ─── GET ONE ──────────────────────────────────────────────────────────────────
  /**
   * Lấy thông tin môn học theo id
   * GET /subjects/{id}
   * AuthN(login) + AuthZ(Admin)
   * 404: môn học không tồn tại
   */
  getSubjectById: async (subjectId: string): Promise<SubjectResponse> => {
    const response = await apiClient.get<SubjectResponse>(`/subjects/${subjectId}`);
    return response.data;
  },

  // ─── GET TEACHERS BY SUBJECT ──────────────────────────────────────────────────
  /**
   * Lấy danh sách giáo viên dạy một môn
   * GET /subjects/{id}/teachers
   * AuthN(login) + AuthZ(Admin)
   * 404: môn học không tồn tại
   */
  getTeachersBySubject: async (subjectId: string): Promise<SubjectTeacherItem[]> => {
    const response = await apiClient.get<SubjectTeacherItem[]>(
      `/subjects/${subjectId}/teachers`
    );
    return response.data;
  },

  // ─── CREATE ───────────────────────────────────────────────────────────────────
  /**
   * Admin tạo môn học mới
   * POST /subjects
   * AuthN(login) + AuthZ(Admin)
   * 400: dữ liệu sai | 409: tên bị trùng
   */
  createSubject: async (payload: CreateSubjectPayload): Promise<SubjectResponse> => {
    const response = await apiClient.post<SubjectResponse>("/subjects", payload);
    return response.data;
  },

  // ─── UPDATE ───────────────────────────────────────────────────────────────────
  /**
   * Admin sửa thông tin môn học
   * PATCH /subjects/{id}
   * AuthN(login) + AuthZ(Admin)
   * 404: môn học không tồn tại | 409: tên bị trùng
   */
  updateSubject: async (
    subjectId: string,
    payload: UpdateSubjectPayload
  ): Promise<SubjectResponse> => {
    const response = await apiClient.patch<SubjectResponse>(`/subjects/${subjectId}`, payload);
    return response.data;
  },

  // ─── TEACHER SUBJECTS (Assignment) ────────────────────────────────────────────
  /**
   * Admin gán môn học cho giáo viên
   * POST /teacher-subjects
   * AuthN(login) + AuthZ(Admin)
   * 409: giáo viên đã được gán môn này
   */
  assignTeacherToSubject: async (teacherId: string, subjectId: string): Promise<any> => {
    const response = await apiClient.post("/teacher-subjects", {
      teacherId,
      subjectId,
    });
    return response.data;
  },

  /**
   * Admin hủy môn học của giáo viên ( soft delete)
   * DELETE /teacher-subjects/{id}
   * AuthN(login) + AuthZ(Admin)
   */
  removeTeacherFromSubject: async (teacherSubjectId: string): Promise<void> => {
    await apiClient.delete(`/teacher-subjects/${teacherSubjectId}`);
  },
};
