import { BaseRequestSecond } from "./common";

export type CourseStatus = 'pending' | 'approved' | 'rejected';

// ─── Response Types ────────────────────────────────────────────────────────────

export interface CourseResponse {
  id: string;
  courseName: string;
  price: number;
  teacherSubjectId: string;
  teacherName: string;
  subjectName: string;
  status: string;
  createdAt: string;
  publishedAt: string | null;
  description: string;
}

/** Dành cho học sinh xem khóa học đã đăng ký */
export interface EnrolledCourseResponse extends CourseResponse {
  enrollAt: string;
  progressPercent: number;
}

// ─── Query Params ──────────────────────────────────────────────────────────────

export interface CourseFilterRequestAdmin extends BaseRequestSecond {
  status?: string;
  courseName?: string;
  subjectId?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface CourseFilterRequestTeacherAndStudent extends BaseRequestSecond {
  courseName?: string;
}

export interface MyCourseFilterRequest extends BaseRequestSecond {
  courseName?: string;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface CreateCoursePayload {
  courseName: string;
  price: number;
  subjectId: string;
  description: string;
}

export interface UpdateCoursePayload {
  courseName: string;
  price: number;
  subjectId: string;
  description: string;
}

export interface UpdateCourseStatusPayload {
  status: string;
}

