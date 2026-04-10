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
   * Retrieves a list of students with pagination, search, and grade/class filtering.
   * GET /students?page=&pageSize=&search=&grade=&classId=
   * AuthN(login)
   */
  getStudents: async (params?: GetStudentsParams): Promise<StudentListResponse> => {
    const response = await apiClient.get<StudentListResponse>("/students", { params });
    return response.data;
  },

  // ─── GET ONE ──────────────────────────────────────────────────────────────────
  /**
   * Retrieves detailed student information by ID.
   * (Used by admin, teacher, or other students to view profiles)
   * GET /students/{id}
   * AuthN(login)
   * 404: Student does not exist
   */
  getStudentById: async (studentId: string): Promise<StudentResponse> => {
    const response = await apiClient.get<StudentResponse>(`/students/${studentId}`);
    return response.data;
  },

  // ─── GET ME ───────────────────────────────────────────────────────────────────
  /**
   * Student retrieves their own profile information.
   * GET /students/me
   * AuthN(login) + AuthZ(Student)
   */
  getMe: async (): Promise<StudentResponse> => {
    const response = await apiClient.get<StudentResponse>("/students/me");
    return response.data;
  },

  // ─── UPDATE (Admin / Teacher cập nhật học sinh) ───────────────────────────────
  /**
   * Admin or Teacher updates student information.
   * - Teacher can only edit students in their own class.
   * - Class changes are not allowed via this endpoint (use /classYear).
   * PATCH /students/{id}
   * AuthN(login) + AuthZ(Admin, Teacher)
   * 404: Student does not exist
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
   * Student updates their own profile information.
   * (Role and class changes are not allowed)
   * PATCH /students/me
   * AuthN(login) + AuthZ(Student)
   */
  updateMe: async (payload: UpdateStudentSelfPayload): Promise<StudentResponse> => {
    const response = await apiClient.patch<StudentResponse>("/students/me", payload);
    return response.data;
  },

  // ─── CHANGE CLASS ─────────────────────────────────────────────────────────────
  /**
   * Admin transfers a student to a different class.
   * PATCH /students/{id}/classYear
   * AuthN(login) + AuthZ(Admin)
   * 400: Invalid data
   * 401: Unauthorized
   * 403: Forbidden (Not an admin)
   * 404: Student or classYear does not exist
   * 409: New class is not in the same school year
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
