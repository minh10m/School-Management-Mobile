import { PagedResponse } from "./common";

// ─── Lesson ───────────────────────────────────────────────────────────────────

export interface LessonResponse {
  id: string;
  lessonName: string;
  courseId: string;
  courseName: string;
  orderIndex: number;
}

export interface LessonFilterRequest {
  courseId: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateLessonPayload {
  lessonName: string;
  courseId: string;
  orderIndex: number;
}

export interface UpdateLessonPayload {
  lessonName: string;
  orderIndex: number;
}

// ─── LessonVideo ──────────────────────────────────────────────────────────────

export interface LessonVideoResponse {
  id: string;
  url: string;
  isPreview: boolean;
  name: string;
  lessonId: string;
  lessonName: string;
  duration: number;
  orderIndex: number;
}

export interface LessonVideoFilterRequest {
  lessonId: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateLessonVideoPayload {
  url: string;
  isPreview: boolean;
  name: string;
  lessonId: string;
  duration: number;
  orderIndex: number;
}

export interface UpdateLessonVideoPayload {
  url: string;
  isPreview: boolean;
  name: string;
  duration: number;
  orderIndex: number;
}

// ─── LessonAssignment ─────────────────────────────────────────────────────────

export interface LessonAssignmentFilterRequest {
  lessonId: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface LessonAssignmentResponse {
  id: string;
  title: string;
  fileUrl: string;
  fileTitle: string;
  lessonId: string;
  lessonName: string;
  orderIndex: number;
}

export interface CreateLessonAssignmentPayload {
  title: string;
  fileUrl?: string; // Keeping for backward compatibility or direct URL entry
  fileTitle?: string;
  file?: {
    uri: string;
    name: string;
    type: string;
  };
  lessonId: string;
  orderIndex: number;
}

export interface UpdateLessonAssignmentPayload {
  title: string;
  fileUrl?: string;
  fileTitle?: string;
  orderIndex: number;
}

