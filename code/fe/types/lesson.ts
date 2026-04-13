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

export interface LessonAssignmentResponse {
  id: string;
  title: string;
  body: string;
  fileUrl: string | null;
  lessonId: string;
}

export interface CreateLessonAssignmentPayload {
  title: string;
  body: string;
  fileUrl?: string;
  lessonId: string;
}

export interface UpdateLessonAssignmentPayload {
  title?: string;
  body?: string;
  fileUrl?: string;
}

