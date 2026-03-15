import {
  CreateFeeDetailPayload,
  CreateFeePayload,
  FeeDetailResponse,
  FeeResponse,
  GetFeesParams,
  StudentFeeDetailResponse,
  UpdateFeeDetailPayload,
  UpdateFeePayload,
} from "../types/fee";
import apiClient from "./apiClient";

// ─── FEE SERVICE ──────────────────────────────────────────────────────────────

export const feeService = {
  /**
   * Admin lấy danh sách phí trong năm học
   * GET /fees?schoolYear=
   * AuthN(login) + AuthZ(Admin)
   */
  getFees: async (params?: GetFeesParams): Promise<FeeResponse[]> => {
    const response = await apiClient.get<FeeResponse[]>("/fees", { params });
    return response.data;
  },

  /**
   * Admin xem danh sách học sinh và trạng thái đóng phí của một loại phí
   * GET /fees/{id}/details
   * AuthN(login) + AuthZ(Admin)
   * 404: fee không tồn tại
   */
  getFeeDetails: async (feeId: string): Promise<FeeDetailResponse[]> => {
    const response = await apiClient.get<FeeDetailResponse[]>(`/fees/${feeId}/details`);
    return response.data;
  },

  /**
   * Admin tạo phí cho một lớp
   * (Backend tự động tạo FeeDetail cho từng học sinh trong lớp)
   * POST /fees
   * AuthN(login) + AuthZ(Admin)
   * 404: classYear không tồn tại
   * 409: phí cho lớp đã tồn tại trong năm học
   * 409: dueDate nhỏ hơn ngày hiện tại
   */
  createFee: async (payload: CreateFeePayload): Promise<FeeResponse> => {
    const response = await apiClient.post<FeeResponse>("/fees", payload);
    return response.data;
  },

  /**
   * Admin sửa thông tin phí
   * ⚠ Không nên sửa amount sau khi đã tạo FeeDetail
   * PATCH /fees/{id}
   * AuthN(login) + AuthZ(Admin)
   * 404: fee / classYear không tồn tại
   */
  updateFee: async (feeId: string, payload: UpdateFeePayload): Promise<FeeResponse> => {
    const response = await apiClient.patch<FeeResponse>(`/fees/${feeId}`, payload);
    return response.data;
  },
};

// ─── FEE DETAIL SERVICE ────────────────────────────────────────────────────────

export const feeDetailService = {
  /**
   * Học sinh xem danh sách các loại phí của mình
   * GET /fee-details/my
   * AuthN(login) + AuthZ(Student)
   */
  getMyFees: async (): Promise<StudentFeeDetailResponse[]> => {
    const response = await apiClient.get<StudentFeeDetailResponse[]>("/fee-details/my");
    return response.data;
  },

  /**
   * Xem chi tiết một phí theo id
   * GET /fee-details/{id}
   * AuthN(login) + AuthZ(Admin, Student)
   * 404: feeDetail không tồn tại
   */
  getFeeDetailById: async (feeDetailId: string): Promise<FeeDetailResponse> => {
    const response = await apiClient.get<FeeDetailResponse>(`/fee-details/${feeDetailId}`);
    return response.data;
  },

  /**
   * Admin tạo phí riêng lẻ cho một học sinh
   * (Dùng khi phí không theo lớp)
   * POST /fee-details
   * AuthN(login) + AuthZ(Admin)
   * status mặc định = unpaid, amountPaid mặc định = 0
   * 404: student không tồn tại
   * 409: học sinh đã có phí này
   */
  createFeeDetail: async (payload: CreateFeeDetailPayload): Promise<FeeDetailResponse> => {
    const response = await apiClient.post<FeeDetailResponse>("/fee-details", payload);
    return response.data;
  },

  /**
   * Admin miễn giảm phí cho học sinh (thay đổi amountDue)
   * PATCH /fee-details/{id}
   * AuthN(login) + AuthZ(Admin)
   * 400: amountDue không hợp lệ
   * 404: feeDetail không tồn tại
   */
  updateFeeDetail: async (
    feeDetailId: string,
    payload: UpdateFeeDetailPayload
  ): Promise<FeeDetailResponse> => {
    const response = await apiClient.patch<FeeDetailResponse>(
      `/fee-details/${feeDetailId}`,
      payload
    );
    return response.data;
  },
};
