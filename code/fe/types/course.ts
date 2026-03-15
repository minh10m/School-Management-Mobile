export type CourseStatus = 'pending' | 'approved' | 'rejected';

// ─── Response Types ────────────────────────────────────────────────────────────

export interface CourseResponse {
  courseId: string;
  courseName: string;
  price: number;
  teacherSubjectId: string;
  status: CourseStatus;
  createdAt: string;
  publishedAt: string | null;
  description: string;
  teacherName: string;
  subjectName: string;
}

/** Dành cho học sinh xem khóa học đã đăng ký */
export interface EnrolledCourseResponse extends CourseResponse {
  enrollAt: string;
  progressPercent: number;
}

// ─── Query Params ──────────────────────────────────────────────────────────────

export interface GetCoursesParams {
  status?: CourseStatus; // 'pending' cho admin | 'approved' cho student/teacher
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface CreateCoursePayload {
  courseName: string;
  price: number;
  teacherSubjectId: string;
  description: string;
  // status không được truyền vào - mặc định 'pending'
}

export interface UpdateCoursePayload {
  courseName?: string;
  price?: number;
  teacherSubjectId?: string;
  description?: string;
}

export interface UpdateCourseStatusPayload {
  status: CourseStatus;
}
