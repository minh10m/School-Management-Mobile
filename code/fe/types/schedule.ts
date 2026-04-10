// ─── Response Types ────────────────────────────────────────────────────────────

/** Lịch học (dành cho học sinh & admin xem theo lớp) */
export interface ScheduleDetailItem {
  scheduleDetailId: string;
  scheduleId: string;
  teacherSubjectId: string;
  dayOfWeek: number;          // 1=Mon, 2=Tue, ..., 7=Sun
  startTime: string;          // e.g. "08:30:00"
  finishTime: string;         // e.g. "09:15:00"
  teacherName: string;
  subjectName: string;
  dayOfWeekVietNamese: string; // e.g. "thứ hai"
  timeRange: string;           // e.g. "08:30 - 09:15"
}

export interface TeacherScheduleDetailItem {
  scheduleDetailId: string;
  className: string;
  subjectName: string;
  dayOfWeek: number;
  startTime: string;
  finishTime: string;
  dayOfWeekVietNamese: string;
  timeRange: string;
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
  schoolYear: string;
  isActive: boolean;
}

/** Schedule detail sau khi tạo / sửa */
export interface ScheduleDetailResponse {
  scheduleDetailId: string;
  scheduleId: string;
  teacherSubjectId: string;
  teacherName: string;
  subjectName: string;
  dayOfWeek: number;
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
  schoolYear?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetMyClassScheduleParams {
  Term?: number;
  SchoolYear?: number;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface CreateSchedulePayload {
  classYearId: string;
  name: string;
  term: string;
  schoolYear: string;
  isActive: boolean;
}

export interface UpdateSchedulePayload {
  name?: string;
  term?: string;
  classYearId?: string;
  schoolYear?: string;
  isActive?: boolean;
}

export interface CreateScheduleDetailPayload {
  teacherSubjectId: string;
  dayOfWeek: number;   // 1-7
  startTime: string;   // "HH:mm:ss"
  finishTime: string;  // "HH:mm:ss"
}

export interface UpdateScheduleDetailPayload {
  teacherSubjectId?: string;
  dayOfWeek?: number;
  startTime?: string;
  finishTime?: string;
}
