// ─── Response Types ────────────────────────────────────────────────────────────

/** Lịch học (dành cho học sinh & admin xem theo lớp) */
export interface ScheduleDetailItem {
  scheduleDetailId: string;
  subjectName: string;
  teacherName: string;
  dayOfWeek: string;   // e.g. "Monday"
  startTime: string;   // e.g. "07:00"
  finishTime: string;  // e.g. "08:30"
}

/** Lịch dạy (dành cho giáo viên) */
export interface TeacherScheduleDetailItem {
  scheduleDetailId: string;
  className: string;
  subjectName: string;
  dayOfWeek: string;
  startTime: string;
  finishTime: string;
}

/** Schedule summary (dành cho admin list) */
export interface ScheduleSummary {
  scheduleId: string;
  className: string;
  name: string;
  term: string;
}

export interface ScheduleSummaryListResponse {
  items: ScheduleSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/** Schedule sau khi tạo / sửa */
export interface ScheduleResponse {
  scheduleId: string;
  term: string;
  name: string;
  classYearId: string;
  className: string;
}

/** Schedule detail sau khi tạo / sửa */
export interface ScheduleDetailResponse {
  scheduleDetailId: string;
  scheduleId: string;
  teacherSubjectId: string;
  dayOfWeek: string;
  startTime: string;
  finishTime: string;
}

// ─── Query Params ──────────────────────────────────────────────────────────────

export interface GetSchedulesParams {
  page?: number;
  pageSize?: number;
  classYearId?: string;
  teacherId?: string;
  term?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface CreateSchedulePayload {
  classYearId: string;
  name: string;
  term: string;
}

export interface UpdateSchedulePayload {
  name?: string;
  term?: string;
  classYearId?: string;
}

export interface CreateScheduleDetailPayload {
  teacherSubjectId: string;
  dayOfWeek: string;   // "Monday" | "Tuesday" | ...
  startTime: string;   // "HH:mm"
  finishTime: string;  // "HH:mm"
}

export interface UpdateScheduleDetailPayload {
  teacherSubjectId?: string;
  dayOfWeek?: string;
  startTime?: string;
  finishTime?: string;
}
