// ─── Lesson ───────────────────────────────────────────────────────────────────

export interface LessonResponse {
  lessonId: string;
  lessonName: string;
  courseId: string;
  orderIndex: number;
}

export interface CreateLessonPayload {
  lessonName: string;
  courseId: string;
  orderIndex: number;
}

export interface UpdateLessonPayload {
  lessonName?: string;
  orderIndex?: number;
}

// ─── LessonVideo ──────────────────────────────────────────────────────────────

export interface LessonVideoResponse {
  videoId: number;
  name: string;
  url: string;
  duration: number; // seconds
  isPreview: boolean;
  lessonId: number;
}

export interface CreateLessonVideoPayload {
  name: string;
  url: string;
  duration: number;
  isPreview: boolean;
  lessonId: number;
}

export interface UpdateLessonVideoPayload {
  name?: string;
  url?: string;
  duration?: number;
  isPreview?: boolean;
}

// ─── LessonAssignment ─────────────────────────────────────────────────────────

export interface LessonAssignmentResponse {
  assignmentId: number;
  title: string;
  body: string;
  fileUrl: string | null;
  lessonId: number;
}

export interface CreateLessonAssignmentPayload {
  title: string;
  body: string;
  fileUrl?: string;
  lessonId: number;
}

export interface UpdateLessonAssignmentPayload {
  title?: string;
  body?: string;
  fileUrl?: string;
}
