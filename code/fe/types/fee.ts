export type FeeDetailStatus = 'unpaid' | 'paid';

// ─── Fee Response Types ────────────────────────────────────────────────────────

export interface FeeResponse {
  feeId: string;
  title: string;
  amount: number;
  dueDate: string;       // ISO date
  classYearId: string;
  className: string;
  schoolYear: string;
}

// ─── FeeDetail Response Types ──────────────────────────────────────────────────

export interface FeeDetailResponse {
  feeDetailId: string;
  feeId: string | null;   // null nếu phí riêng lẻ không thuộc fee tổng
  studentId: string;
  studentName: string;
  status: FeeDetailStatus;
  amountDue: number;
  amountPaid: number;
  paidAt: string | null;
  reason: string;
}

/** Dành cho học sinh xem phí của mình (ít trường hơn) */
export interface StudentFeeDetailResponse {
  feeDetailId: string;
  feeId: string | null;
  status: FeeDetailStatus;
  amountDue: number;
  amountPaid: number;
  paidAt: string | null;
  reason: string;
}

// ─── Fee Query Params ──────────────────────────────────────────────────────────

export interface GetFeesParams {
  schoolYear?: string;
}

// ─── Fee Request Payloads ──────────────────────────────────────────────────────

export interface CreateFeePayload {
  title: string;
  amount: number;
  dueDate: string;       // ISO date
  classYearId: string;
  schoolYear: string;
}

export interface UpdateFeePayload {
  title?: string;
  amount?: number;
  dueDate?: string;
  classYearId?: string;
  schoolYear?: string;
}

// ─── FeeDetail Request Payloads ────────────────────────────────────────────────

/** Admin miễn giảm phí cho học sinh */
export interface UpdateFeeDetailPayload {
  amountDue: number;
}

/** Admin tạo phí riêng lẻ cho học sinh */
export interface CreateFeeDetailPayload {
  studentId: string;
  amountDue: number;
  amountPaid?: number;   // mặc định = 0
  reason: string;
}
