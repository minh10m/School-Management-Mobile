import {
  CreateLessonAssignmentPayload,
  CreateLessonPayload,
  CreateLessonVideoPayload,
  LessonAssignmentFilterRequest,
  LessonAssignmentResponse,
  LessonFilterRequest,
  LessonResponse,
  LessonVideoFilterRequest,
  LessonVideoResponse,
  UpdateLessonAssignmentPayload,
  UpdateLessonPayload,
  UpdateLessonVideoPayload,
} from "../types/lesson";
import { ApiResponse, PagedResponse } from "../types/common";
import apiClient from "./apiClient";

// ─── LESSONS ──────────────────────────────────────────────────────────────────

export const lessonService = {
  /**
   * Lấy danh sách lesson theo courseId (có phân trang)
   * GET /lessons
   */
  getLessons: async (params: LessonFilterRequest): Promise<PagedResponse<LessonResponse>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<LessonResponse>>>("/lessons", {
      params,
    });
    return response.data.data;
  },

  /**
   * Xem chi tiết lesson theo id
   * GET /lessons/{id}
   */
  getLessonById: async (lessonId: string): Promise<LessonResponse> => {
    const response = await apiClient.get<ApiResponse<LessonResponse>>(`/lessons/${lessonId}`);
    return response.data.data;
  },

  /**
   * Giáo viên tạo lesson
   * POST /lessons
   */
  createLesson: async (payload: CreateLessonPayload): Promise<LessonResponse> => {
    const response = await apiClient.post<ApiResponse<LessonResponse>>("/lessons", payload);
    return response.data.data;
  },

  /**
   * Giáo viên sửa lesson
   * PATCH /lessons/{id}
   */
  updateLesson: async (lessonId: string, payload: UpdateLessonPayload): Promise<LessonResponse> => {
    const response = await apiClient.patch<ApiResponse<LessonResponse>>(`/lessons/${lessonId}`, payload);
    return response.data.data;
  },
};

// ─── LESSON VIDEOS ────────────────────────────────────────────────────────────

export const lessonVideoService = {
  /**
   * Lấy danh sách video theo lessonId (có phân trang)
   * GET /lesson-videos
   */
  getLessonVideos: async (params: LessonVideoFilterRequest): Promise<PagedResponse<LessonVideoResponse>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<LessonVideoResponse>>>("/lesson-videos", {
      params,
    });
    return response.data.data;
  },

  /**
   * Xem chi tiết video theo id
   * GET /lesson-videos/{id}
   */
  getLessonVideoById: async (videoId: string): Promise<LessonVideoResponse> => {
    const response = await apiClient.get<ApiResponse<LessonVideoResponse>>(`/lesson-videos/${videoId}`);
    return response.data.data;
  },

  /**
   * Giáo viên tạo video
   * POST /lesson-videos
   */
  createLessonVideo: async (payload: CreateLessonVideoPayload): Promise<LessonVideoResponse> => {
    const response = await apiClient.post<ApiResponse<LessonVideoResponse>>("/lesson-videos", payload);
    return response.data.data;
  },

  /**
   * Giáo viên sửa video
   * PATCH /lesson-videos/{id}
   */
  updateLessonVideo: async (
    videoId: string,
    payload: UpdateLessonVideoPayload
  ): Promise<LessonVideoResponse> => {
    const response = await apiClient.patch<ApiResponse<LessonVideoResponse>>(
      `/lesson-videos/${videoId}`,
      payload
    );
    return response.data.data;
  },
};

// ─── LESSON ASSIGNMENTS ────────────────────────────────────────────────────────

export const lessonAssignmentService = {
  /**
   * Lấy danh sách bài tập theo lessonId
   * GET /lesson-assignments
   */
  getLessonAssignments: async (params: LessonAssignmentFilterRequest): Promise<PagedResponse<LessonAssignmentResponse>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<LessonAssignmentResponse>>>("/lesson-assignments", {
      params,
    });
    return response.data.data;
  },

  /**
   * Xem chi tiết bài tập lesson theo id
   * GET /lesson-assignments/{id}
   */
  getLessonAssignmentById: async (assignmentId: string): Promise<LessonAssignmentResponse> => {
    const response = await apiClient.get<ApiResponse<LessonAssignmentResponse>>(
      `/lesson-assignments/${assignmentId}`
    );
    return response.data.data;
  },

  /**
   * Giáo viên tạo bài tập cho lesson
   * POST /lesson-assignments
   */
  createLessonAssignment: async (
    payload: CreateLessonAssignmentPayload
  ): Promise<LessonAssignmentResponse> => {
    const response = await apiClient.post<ApiResponse<LessonAssignmentResponse>>(
      "/lesson-assignments",
      payload
    );
    return response.data.data;
  },

  /**
   * Giáo viên sửa bài tập lesson
   * PATCH /lesson-assignments/{id}
   */
  updateLessonAssignment: async (
    assignmentId: string,
    payload: UpdateLessonAssignmentPayload
  ): Promise<LessonAssignmentResponse> => {
    const response = await apiClient.patch<ApiResponse<LessonAssignmentResponse>>(
      `/lesson-assignments/${assignmentId}`,
      payload
    );
    return response.data.data;
  },
};

