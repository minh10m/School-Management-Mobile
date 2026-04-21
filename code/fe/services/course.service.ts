import {
  CourseFilterRequestAdmin,
  CourseFilterRequestTeacherAndStudent,
  CourseResponse,
  CreateCoursePayload,
  EnrolledCourseResponse,
  MyCourseFilterRequest,
  UpdateCoursePayload,
  UpdateCourseStatusPayload,
} from "../types/course";
import { ApiResponse, PagedResponse } from "../types/common";
import apiClient from "./apiClient";

export const courseService = {
  // ─── LISTS ──────────────────────────────────────────────────────────────────

  /**
   * Admin lấy danh sách khóa học (có phân trang & lọc)
   * GET /courses/all/forAdmin
   */
  getAllCourseForAdmin: async (params: CourseFilterRequestAdmin): Promise<PagedResponse<CourseResponse>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<CourseResponse>>>("/courses/all/forAdmin", { params });
    return response.data.data;
  },

  /**
   * Học sinh/Giáo viên lấy danh sách khóa học đã duyệt (có phân trang & lọc)
   * GET /courses/all/approved
   */
  getAllCourseApproved: async (params: CourseFilterRequestTeacherAndStudent): Promise<PagedResponse<CourseResponse>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<CourseResponse>>>("/courses/all/approved", { params });
    return response.data.data;
  },

  /**
   * Giáo viên lấy danh sách khóa học của mình
   * GET /courses/my
   */
  getMyCourses: async (params: MyCourseFilterRequest): Promise<PagedResponse<CourseResponse>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<CourseResponse>>>("/courses/my", { params });
    return response.data.data;
  },

  /**
   * Học sinh lấy danh sách khóa học đã đăng ký
   * (Giả sử endpoint này vẫn giữ nguyên hoặc cần cập nhật sau)
   */
  getRegisteredCourses: async (params?: MyCourseFilterRequest): Promise<PagedResponse<CourseResponse>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<CourseResponse>>>("/courses/registered", { params });
    return response.data.data;
  },

  // ─── GET ONE ──────────────────────────────────────────────────────────────────

  /**
   * Xem chi tiết khóa học theo id
   * GET /courses/{id}
   */
  getCourseById: async (courseId: string): Promise<CourseResponse> => {
    const response = await apiClient.get<ApiResponse<CourseResponse>>(`/courses/${courseId}`);
    return response.data.data;
  },

  // ─── MUTATIONS ──────────────────────────────────────────────────────────────

  /**
   * Giáo viên tạo khóa học
   * POST /courses
   */
  createCourse: async (payload: CreateCoursePayload): Promise<CourseResponse> => {
    const response = await apiClient.post<ApiResponse<CourseResponse>>("/courses", payload);
    return response.data.data;
  },

  /**
   * Giáo viên sửa khóa học
   * PATCH /courses/{id}
   */
  updateCourse: async (courseId: string, payload: UpdateCoursePayload): Promise<CourseResponse> => {
    const response = await apiClient.patch<ApiResponse<CourseResponse>>(`/courses/${courseId}`, payload);
    return response.data.data;
  },

  /**
   * Admin duyệt/từ chối khóa học
   * PATCH /courses/{id}/status
   */
  updateCourseStatus: async (
    courseId: string,
    payload: UpdateCourseStatusPayload
  ): Promise<CourseResponse> => {
    const response = await apiClient.patch<ApiResponse<CourseResponse>>(
      `/courses/${courseId}/status`,
      payload
    );
    return response.data.data;
  },
};

