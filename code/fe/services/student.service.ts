import {
  GetStudentsParams,
  StudentListResponse,
  StudentResponse,
  UpdateStudentClassPayload,
  UpdateStudentPayload,
  UpdateStudentSelfPayload,
} from "../types/student";
import apiClient from "./apiClient";

export const studentService = {
  // ─── LIST ─────────────────────────────────────────────────────────────────────
  /**
   * Lấy danh sách học sinh (có phân trang, search, lọc theo khối/lớp)
   * GET /students?page=&pageSize=&search=&grade=&classId=
   * AuthN(login)
   */
  getStudents: async (params?: GetStudentsParams): Promise<StudentListResponse> => {
    const response = await apiClient.get<StudentListResponse>("/students", { params });
    return response.data;
  },

  // ─── GET ONE ──────────────────────────────────────────────────────────────────
  /**
   * Lấy thông tin chi tiết học sinh theo id
   * (dành cho admin, teacher, student khác xem hồ sơ)
   * GET /students/{id}
   * AuthN(login)
   * 404: học sinh không tồn tại
   */
  getStudentById: async (studentId: string): Promise<StudentResponse> => {
    const response = await apiClient.get<StudentResponse>(`/students/${studentId}`);
    return response.data;
  },

  // ─── GET ME ───────────────────────────────────────────────────────────────────
  /**
   * Học sinh lấy thông tin profile bản thân
   * GET /students/me
   * AuthN(login) + AuthZ(Student)
   */
  getMe: async (): Promise<StudentResponse> => {
    const response = await apiClient.get<StudentResponse>("/students/me");
    return response.data;
  },

  // ─── UPDATE (Admin / Teacher cập nhật học sinh) ───────────────────────────────
  /**
   * Admin / Teacher chỉnh sửa thông tin học sinh
   * - Teacher chỉ được sửa student trong lớp mình
   * - Không được sửa lớp qua endpoint này (dùng /classYear)
   * PATCH /students/{id}
   * AuthN(login) + AuthZ(Admin, Teacher)
   * 404: học sinh không tồn tại
   */
  updateStudent: async (
    studentId: string,
    payload: UpdateStudentPayload
  ): Promise<StudentResponse> => {
    const response = await apiClient.patch<StudentResponse>(
      `/students/${studentId}`,
      payload
    );
    return response.data;
  },

  // ─── UPDATE ME (Học sinh tự cập nhật) ────────────────────────────────────────
  /**
   * Học sinh tự cập nhật thông tin bản thân
   * (không được sửa role, không được sửa lớp)
   * PATCH /students/me
   * AuthN(login) + AuthZ(Student)
   */
  updateMe: async (payload: UpdateStudentSelfPayload): Promise<StudentResponse> => {
    const response = await apiClient.patch<StudentResponse>("/students/me", payload);
    return response.data;
  },

  // ─── CHANGE CLASS ─────────────────────────────────────────────────────────────
  /**
   * Admin chuyển lớp cho học sinh
   * PATCH /students/{id}/classYear
   * AuthN(login) + AuthZ(Admin)
   * 400: dữ liệu sai
   * 401: chưa đăng nhập
   * 403: không phải admin
   * 404: student không tồn tại / classYear không tồn tại
   * 409: lớp không cùng năm học
   */
  updateClass: async (
    studentId: string,
    payload: UpdateStudentClassPayload
  ): Promise<StudentResponse> => {
    const response = await apiClient.patch<StudentResponse>(
      `/students/${studentId}/classYear`,
      payload
    );
    return response.data;
  },
};
