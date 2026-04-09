import { AssignSubjectPayload, TeacherSubjectResponse, UpdateTeacherSubjectPayload } from "../types/teacherSubject";
import apiClient from "./apiClient";

export const teacherSubjectService = {
  // ─── ASSIGN SUBJECT TO TEACHER ────────────────────────────────────────────────
  /**
   * Admin gán môn học cho giáo viên
   * (dùng khi tạo tài khoản hoặc thêm môn sau này)
   * POST /teacher-subjects
   * AuthN(login) + AuthZ(Admin)
   * 404: teacher hoặc subject không tồn tại
   * 409: giáo viên đã được gán môn này
   */
  assignSubject: async (payload: AssignSubjectPayload): Promise<TeacherSubjectResponse> => {
    const response = await apiClient.post<TeacherSubjectResponse>(
      "/teacher-subjects",
      payload
    );
    return response.data;
  },

  // ─── REMOVE SUBJECT FROM TEACHER ─────────────────────────────────────────────
  /**
   * Admin xóa môn học khỏi giáo viên (xóa mềm)
   * DELETE /teacher-subjects/{id}
   * AuthN(login) + AuthZ(Admin)
   */
  removeSubject: async (teacherSubjectId: string): Promise<void> => {
    await apiClient.delete(`/teacher-subjects/${teacherSubjectId}`);
  },

  // ─── UPDATE SUBJECT FOR TEACHER ─────────────────────────────────────────────
  /**
   * Admin sửa môn học của giáo viên
   * PATCH /teacher-subjects
   * AuthN(login) + AuthZ(Admin)
   */
  updateSubjectForTeacher: async (payload: UpdateTeacherSubjectPayload): Promise<any> => {
    const response = await apiClient.patch("/teacher-subjects", payload);
    return response.data;
  },
};
