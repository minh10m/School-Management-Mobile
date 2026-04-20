import { ApiResponse } from "../types/common";
import { PaymentHistoryResponse, PaymentRequest, PaymentResponse } from "../types/payment";
import apiClient from "./apiClient";

export const paymentService = {
  /**
   * Create a payment record for a fee or course
   * POST /api/payments
   */
  payTheBill: async (payload: PaymentRequest): Promise<PaymentResponse> => {
    const response = await apiClient.post<ApiResponse<PaymentResponse>>("/payments", payload);
    return response.data.data;
  },

  /**
   * Get student's payment history
   * GET /api/payments/my
   */
  getMyPayments: async (): Promise<PaymentHistoryResponse[]> => {
    const response = await apiClient.get<ApiResponse<PaymentHistoryResponse[]>>("/payments/my");
    return response.data.data;
  },
};
