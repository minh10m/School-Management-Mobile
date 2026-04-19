import { ApiResponse } from "../types/common";
import { CreatePaymentPayload, PaymentResponse, PaymentHistoryResponse } from "../types/payment";
import apiClient from "./apiClient";

export const paymentService = {
  // ─── CREATE PAYMENT ───────────────────────────────────────────────────────────
  /**
   * Tạo payment (khi người dùng nhấn thanh toán khóa học hoặc học phí)
   * POST /api/payments
   */
  createPayment: async (payload: CreatePaymentPayload): Promise<PaymentResponse> => {
    const response = await apiClient.post<ApiResponse<PaymentResponse>>("/payments", payload);
    return response.data.data;
  },

  // ─── ADMIN ────────────────────────────────────────────────────────────────────
  /**
   * Lấy danh sách giao dịch (Dành cho Admin)
   * GET /api/payments
   */
  getAllPayments: async (params?: any): Promise<PaymentHistoryResponse[]> => {
    const response = await apiClient.get<ApiResponse<PaymentHistoryResponse[]>>("/payments", { params });
    return response.data.data;
  },

  /**
   * Sinh viên lấy danh sách giao dịch của chính mình
   * GET /api/payments/my
   */
  getMyPayments: async (): Promise<PaymentHistoryResponse[]> => {
    const response = await apiClient.get<ApiResponse<PaymentHistoryResponse[]>>("/payments/my");
    return response.data.data;
  },

  // ─── WEBHOOK ──────────────────────────────────────────────────────────────────
  /**
   * Webhook nhận callback từ SePay sau khi thanh toán thành công
   * Backend verify chữ ký → so sánh amount → cập nhật status = success
   * POST /api/payments/webhook
   * ⚠ Lưu ý: Hàm này thường chỉ được gọi bởi SePay. 
   * Dưới đây là cách gọi từ Frontend nếu muốn giả lập/test.
   */
  processWebhook: async (orderCode: string, amount: number): Promise<any> => {
    // MOCK_SECRET_KEY phải khớp với configuration["Sepay:ApiKey"] trên Backend
    const MOCK_SECRET_KEY = "sepay_secret_key_123"; 

    const payload = {
      id: Math.floor(Math.random() * 1000000), // Giả lập transaction ID
      content: orderCode, // Nội dung chuyển khoản chứa mã đơn hàng
      transferAmount: amount,
      transferDate: new Date().toISOString(),
      gateway: "BIDV"
    };

    const response = await apiClient.post("/payments/webhook", payload, {
      headers: {
        Authorization: `Apikey ${MOCK_SECRET_KEY}`
      }
    });
    return response.data;
  },
};
