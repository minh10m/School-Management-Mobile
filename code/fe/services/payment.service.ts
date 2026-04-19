import { CreatePaymentPayload, PaymentResponse } from "../types/payment";
import apiClient from "./apiClient";

export const paymentService = {
  // ─── CREATE PAYMENT ───────────────────────────────────────────────────────────
  /**
   * Tạo payment (khi người dùng nhấn thanh toán khóa học hoặc học phí)
   * Quy trình: tạo payment (status=pending) → gọi sepay → nhận QR → hiển thị
   * POST /payments
   * Tự động khi người dùng nhấn thanh toán
   */
  createPayment: async (payload: CreatePaymentPayload): Promise<PaymentResponse> => {
    const response = await apiClient.post<PaymentResponse>("/payments", payload);
    return response.data;
  },

  // ─── GET PAYMENT ──────────────────────────────────────────────────────────────
  /**
   * Lấy thông tin thanh toán theo paymentId
   * GET /payments/{id}
   * (Dùng để polling kiểm tra status sau khi quét QR)
   */
  getPaymentById: async (paymentId: string): Promise<PaymentResponse> => {
    const response = await apiClient.get<PaymentResponse>(`/payments/${paymentId}`);
    return response.data;
  },

  // ─── WEBHOOK ──────────────────────────────────────────────────────────────────
  /**
   * Webhook nhận callback từ SePay sau khi thanh toán thành công
   * Backend verify chữ ký → so sánh amount → cập nhật status = success
   * → tạo EnrollCourse hoặc cập nhật FeeDetail
   * POST /payments/webhook
   * ⚠ Chỉ được gọi bởi SePay, không phải frontend
   */
  // webhook: handled entirely by backend
};
