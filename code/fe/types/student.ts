// ─── Response Types ────────────────────────────────────────────────────────────

/** Dùng trong danh sách (list endpoint) */
export interface StudentListItem {
  studentId: string;
  userId: string;
  fullName: string;
  className: string;
  grade: string;
}

export interface StudentListResponse {
  items: StudentListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ClassYearSub {
  classYearId: string;
  grade: number;
  schoolYear: number;
  className: string;
}

/** Chi tiết học sinh (get by id / get me) */
export interface StudentResponse {
  studentId: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  birthday: string; // ISO date string
  classYearSub: ClassYearSub[];
}

// ─── Query Params ──────────────────────────────────────────────────────────────

export interface GetStudentsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  grade?: string;   // lọc theo khối
  classId?: string; // lọc theo ID lớp (backend có thể không hỗ trợ)
  className?: string; // lọc theo tên lớp
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

/** Admin / Teacher cập nhật thông tin học sinh */
export interface UpdateStudentPayload {
  fullName?: string;
  email?: string;
  phone?: string;
  birthday?: string; // ISO date string
  address?: string;
}

/** Học sinh tự cập nhật profile (không được sửa lớp / role) */
export interface UpdateStudentSelfPayload {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  birthday?: string; // ISO date string "YYYY-MM-DD"
}

/** Admin chuyển lớp học sinh */
export interface UpdateStudentClassPayload {
  classYearId: string;
}
