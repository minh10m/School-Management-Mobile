export type PaymentType = 'course' | 'fee';
export type PaymentStatus = 'pending' | 'success' | 'failed';

// ─── Response Types ────────────────────────────────────────────────────────────

export interface PaymentResponse {
  paymentId: string;
  orderCode: string;
  amount: number;
  description: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  bin: string;
  qrCodeUrl: string;
}

export interface PaymentHistoryResponse {
  paymentId: string;
  orderCode: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  createdAt: string;
  userName: string;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface CreatePaymentPayload {
  feeDetailId?: string;
  courseId?: string;
}
