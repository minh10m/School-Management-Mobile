import {
  CourseResponse,
  CreateCoursePayload,
  EnrolledCourseResponse,
  GetCoursesParams,
  UpdateCoursePayload,
  UpdateCourseStatusPayload,
} from "../types/course";
import apiClient from "./apiClient";

export const courseService = {
  // ─── LIST (Admin pending | Student/Teacher approved) ──────────────────────────
  /**
   * Lấy danh sách khóa học theo status
   * - Admin: status=pending (chờ duyệt)
   * - Student/Teacher: status=approved (đã được duyệt)
   * GET /courses?status=
   * AuthN(login)
   */
  getCourses: async (params?: GetCoursesParams): Promise<CourseResponse[]> => {
    const response = await apiClient.get<CourseResponse[]>("/courses", { params });
    return response.data;
  },

  // ─── GET ONE ──────────────────────────────────────────────────────────────────
  /**
   * Xem chi tiết khóa học theo id
   * GET /courses/{id}
   * AuthN(login)
   * 404: khóa học không tồn tại
   */
  getCourseById: async (courseId: string): Promise<CourseResponse> => {
    const response = await apiClient.get<CourseResponse>(`/courses/${courseId}`);
    return response.data;
  },

  // ─── TEACHER: GET MY COURSES ──────────────────────────────────────────────────
  /**
   * Giáo viên lấy danh sách khóa học do mình tạo
   * GET /courses/my
   * AuthN(login) + AuthZ(Teacher)
   */
  getMyCourses: async (): Promise<CourseResponse[]> => {
    const response = await apiClient.get<CourseResponse[]>("/courses/my");
    return response.data;
  },

  // ─── STUDENT: GET REGISTERED COURSES ─────────────────────────────────────────
  /**
   * Học sinh lấy danh sách khóa học đã mua / đã đăng ký
   * GET /courses/registered
   * AuthN(login) + AuthZ(Student)
   */
  getRegisteredCourses: async (): Promise<EnrolledCourseResponse[]> => {
    const response = await apiClient.get<EnrolledCourseResponse[]>("/courses/registered");
    return response.data;
  },

  // ─── TEACHER: CREATE ──────────────────────────────────────────────────────────
  /**
   * Giáo viên tạo khóa học (status mặc định = pending, chờ admin duyệt)
   * POST /courses
   * AuthN(login) + AuthZ(Teacher)
   * 409: courseName đã tồn tại trong cùng teacherSubject
   */
  createCourse: async (payload: CreateCoursePayload): Promise<CourseResponse> => {
    const response = await apiClient.post<CourseResponse>("/courses", payload);
    return response.data;
  },

  // ─── TEACHER: UPDATE ──────────────────────────────────────────────────────────
  /**
   * Giáo viên sửa khóa học (chỉ người tạo mới được sửa, không được sửa status)
   * PATCH /courses/{id}
   * AuthN(login) + AuthZ(Teacher)
   * 403: không phải chủ khóa học
   */
  updateCourse: async (courseId: string, payload: UpdateCoursePayload): Promise<CourseResponse> => {
    const response = await apiClient.patch<CourseResponse>(`/courses/${courseId}`, payload);
    return response.data;
  },

  // ─── ADMIN: UPDATE STATUS ─────────────────────────────────────────────────────
  /**
   * Admin duyệt / từ chối khóa học
   * (approved → publishedAt = now, pending/rejected → không thay đổi)
   * PATCH /courses/{id}/status
   * AuthN(login) + AuthZ(Admin)
   * 404: khóa học không tồn tại
   */
  updateCourseStatus: async (
    courseId: string,
    payload: UpdateCourseStatusPayload
  ): Promise<CourseResponse> => {
    const response = await apiClient.patch<CourseResponse>(
      `/courses/${courseId}/status`,
      payload
    );
    return response.data;
  },
};
