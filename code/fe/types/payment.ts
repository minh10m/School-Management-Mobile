export interface PaymentRequest {
  feeDetailId?: string;
  courseId?: string;
}

export interface PaymentResponse {
  paymentId: string;
  orderCode: string;
  amount: number;
  description: string;
  accountName: string;
  accountNumber: string;
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
