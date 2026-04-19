export type PaymentType = 'course' | 'fee';
export type PaymentStatus = 'pending' | 'success' | 'failed';

// ─── Response Types ────────────────────────────────────────────────────────────

export interface PaymentResponse {
  paymentId: string;
  userId: string;
  amount: number;
  orderCode: string;
  refId: string;          // courseId hoặc feeId
  type: PaymentType;
  status: PaymentStatus;
  body: string;
  description: string;
  createdAt: string;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface CreatePaymentPayload {
  refId: string;          // courseId hoặc feeId
  type: PaymentType;
  body: string;
  description: string;
}
