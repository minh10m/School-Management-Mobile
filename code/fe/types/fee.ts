import { BaseRequestSecond } from "./common";

export type FeeDetailStatus = 'unpaid' | 'paid';

// ─── Fee Response Types ────────────────────────────────────────────────────────

export interface FeeResponse {
  id: string;
  title: string;
  amount: number;
  dueDate: string;       // ISO date
  classYearId: string;
  className: string;
  schoolYear: number;
}

// ─── FeeDetail Response Types ──────────────────────────────────────────────────

export interface FeeDetailResponse {
  id: string;
  feeId: string | null;   // null nếu phí riêng lẻ không thuộc fee tổng
  studentId: string;
  studentName: string;
  status: string;         // 'unpaid' | 'paid' or other Status string from backend
  amountDue: number;
  schoolYear: number;
  amountPaid: number;
  paidAt: string | null;
  reason: string;
}

// ─── Filter Params Interfaces ──────────────────────────────────────────────────

export interface FeeFilterRequest extends BaseRequestSecond {
  schoolYear: number;
}

export interface FeeDetailFilterRequest extends BaseRequestSecond {
  feeId?: string;
  schoolYear: number;
  studentName?: string;
}

export interface MyFeeDetailFilterRequest extends BaseRequestSecond {
  schoolYear: number;
  reason?: string;
}

// ─── Request Payloads ──────────────────────────────────────────────────────────

export interface CreateFeeRequest {
  title: string;
  amount: number;
  dueDate: string;       // ISO date
  classYearId: string;
  schoolYear: number;
}

export interface UpdateFeeRequest {
  title?: string;
  amount?: number;
  dueDate?: string;
  classYearId?: string;
  schoolYear?: number;
}

export interface FeeDetailRequest {
  studentId: string;
  amountDue: number;
  schoolYear: number;
  reason: string;
}

export interface UpdateFeeDetailRequest {
  amountDue: number;
}

