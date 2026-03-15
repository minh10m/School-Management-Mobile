import {
  CreateLessonAssignmentPayload,
  CreateLessonPayload,
  CreateLessonVideoPayload,
  LessonAssignmentResponse,
  LessonResponse,
  LessonVideoResponse,
  UpdateLessonAssignmentPayload,
  UpdateLessonPayload,
  UpdateLessonVideoPayload,
} from "../types/lesson";
import apiClient from "./apiClient";

// ─── LESSONS ──────────────────────────────────────────────────────────────────

export const lessonService = {
  /**
   * Lấy danh sách lesson theo courseId
   * GET /lessons?courseId=
   * AuthN(login)
   * 404: course không tồn tại
   */
  getLessons: async (courseId: string): Promise<LessonResponse[]> => {
    const response = await apiClient.get<LessonResponse[]>("/lessons", {
      params: { courseId },
    });
    return response.data;
  },

  /**
   * Xem chi tiết lesson theo id
   * GET /lessons/{id}
   * AuthN(login)
   * 404: lesson không tồn tại
   */
  getLessonById: async (lessonId: string): Promise<LessonResponse> => {
    const response = await apiClient.get<LessonResponse>(`/lessons/${lessonId}`);
    return response.data;
  },

  /**
   * Giáo viên tạo lesson
   * POST /lessons
   * AuthN(login) + AuthZ(Teacher)
   * 409: orderIndex hoặc lessonName đã tồn tại trong course
   */
  createLesson: async (payload: CreateLessonPayload): Promise<LessonResponse> => {
    const response = await apiClient.post<LessonResponse>("/lessons", payload);
    return response.data;
  },

  /**
   * Giáo viên sửa lesson
   * PATCH /lessons/{id}
   * AuthN(login) + AuthZ(Teacher)
   * 409: orderIndex / lessonName bị trùng
   */
  updateLesson: async (lessonId: string, payload: UpdateLessonPayload): Promise<LessonResponse> => {
    const response = await apiClient.patch<LessonResponse>(`/lessons/${lessonId}`, payload);
    return response.data;
  },
};

// ─── LESSON VIDEOS ────────────────────────────────────────────────────────────

export const lessonVideoService = {
  /**
   * Lấy danh sách video theo lessonId
   * GET /lesson-videos?lessonId=
   * AuthN(login)
   * 404: lesson không tồn tại
   */
  getLessonVideos: async (lessonId: number): Promise<LessonVideoResponse[]> => {
    const response = await apiClient.get<LessonVideoResponse[]>("/lesson-videos", {
      params: { lessonId },
    });
    return response.data;
  },

  /**
   * Xem chi tiết video theo id
   * GET /lesson-videos/{id}
   * AuthN(login)
   * 404: video không tồn tại
   * Note: Học sinh chưa mua khóa chỉ xem được video có isPreview = true
   */
  getLessonVideoById: async (videoId: number): Promise<LessonVideoResponse> => {
    const response = await apiClient.get<LessonVideoResponse>(`/lesson-videos/${videoId}`);
    return response.data;
  },

  /**
   * Giáo viên tạo video
   * POST /lesson-videos
   * AuthN(login) + AuthZ(Teacher)
   * 409: tên video bị trùng trong lesson
   */
  createLessonVideo: async (payload: CreateLessonVideoPayload): Promise<LessonVideoResponse> => {
    const response = await apiClient.post<LessonVideoResponse>("/lesson-videos", payload);
    return response.data;
  },

  /**
   * Giáo viên sửa video
   * PATCH /lesson-videos/{id}
   * AuthN(login) + AuthZ(Teacher)
   * 409: tên video bị trùng trong lesson
   */
  updateLessonVideo: async (
    videoId: number,
    payload: UpdateLessonVideoPayload
  ): Promise<LessonVideoResponse> => {
    const response = await apiClient.patch<LessonVideoResponse>(
      `/lesson-videos/${videoId}`,
      payload
    );
    return response.data;
  },
};

// ─── LESSON ASSIGNMENTS ────────────────────────────────────────────────────────

export const lessonAssignmentService = {
  /**
   * Lấy danh sách bài tập theo lessonId
   * GET /lesson-assignments?lessonId=
   * AuthN(login)
   * 404: lesson không tồn tại
   */
  getLessonAssignments: async (lessonId: number): Promise<LessonAssignmentResponse[]> => {
    const response = await apiClient.get<LessonAssignmentResponse[]>("/lesson-assignments", {
      params: { lessonId },
    });
    return response.data;
  },

  /**
   * Xem chi tiết bài tập lesson theo id
   * GET /lesson-assignments/{id}
   * AuthN(login)
   * 404: bài tập không tồn tại
   */
  getLessonAssignmentById: async (assignmentId: number): Promise<LessonAssignmentResponse> => {
    const response = await apiClient.get<LessonAssignmentResponse>(
      `/lesson-assignments/${assignmentId}`
    );
    return response.data;
  },

  /**
   * Giáo viên tạo bài tập cho lesson
   * POST /lesson-assignments
   * AuthN(login) + AuthZ(Teacher)
   * 409: tên bài tập đã tồn tại trong lesson
   */
  createLessonAssignment: async (
    payload: CreateLessonAssignmentPayload
  ): Promise<LessonAssignmentResponse> => {
    const response = await apiClient.post<LessonAssignmentResponse>(
      "/lesson-assignments",
      payload
    );
    return response.data;
  },

  /**
   * Giáo viên sửa bài tập lesson
   * PATCH /lesson-assignments/{id}
   * AuthN(login) + AuthZ(Teacher)
   * 409: tên bài tập đã tồn tại trong lesson
   */
  updateLessonAssignment: async (
    assignmentId: number,
    payload: UpdateLessonAssignmentPayload
  ): Promise<LessonAssignmentResponse> => {
    const response = await apiClient.patch<LessonAssignmentResponse>(
      `/lesson-assignments/${assignmentId}`,
      payload
    );
    return response.data;
  },
};
