import { ApiResponse, PagedResponse } from "../types/common";
import {
  CreateFeeRequest,
  FeeDetailFilterRequest,
  FeeDetailRequest,
  FeeDetailResponse,
  FeeFilterRequest,
  FeeResponse,
  MyFeeDetailFilterRequest,
  UpdateFeeDetailRequest,
  UpdateFeeRequest,
} from "../types/fee";
import apiClient from "./apiClient";

// ─── FEE SERVICE (ADMIN) ───────────────────────────────────────────────────────

export const feeService = {
  /**
   * Admin lấy danh sách phí tổng quát
   * GET /api/fees
   */
  getFees: async (params: FeeFilterRequest): Promise<PagedResponse<FeeResponse>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<FeeResponse>>>("/fees", { params });
    return response.data.data;
  },

  /**
   * Admin xem danh sách chi tiết các khoản phí (trạng thái đóng tiền của từng HS)
   * GET /api/fees/details
   */
  getAllFeeDetails: async (params: FeeDetailFilterRequest): Promise<PagedResponse<FeeDetailResponse>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<FeeDetailResponse>>>("/fees/details", { params });
    return response.data.data;
  },

  /**
   * Admin tạo một khoản phí mới (theo lớp/toàn trường)
   * POST /api/fees
   */
  createFee: async (payload: CreateFeeRequest): Promise<FeeResponse> => {
    const response = await apiClient.post<ApiResponse<FeeResponse>>("/fees", payload);
    return response.data.data;
  },

  /**
   * Admin sửa thông tin phí tổng quát
   * PATCH /api/fees/{id}
   */
  updateFee: async (feeId: string, payload: UpdateFeeRequest): Promise<FeeResponse> => {
    const response = await apiClient.patch<ApiResponse<FeeResponse>>(`/fees/${feeId}`, payload);
    return response.data.data;
  },
};

// ─── FEE DETAIL SERVICE (STUDENT & ADMIN) ──────────────────────────────────────

export const feeDetailService = {
  /**
   * Sinh viên xem danh sách các khoản phí của cá nhân mình
   * GET /api/fee-details/my
   */
  getMyFees: async (params: MyFeeDetailFilterRequest): Promise<PagedResponse<FeeDetailResponse>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<FeeDetailResponse>>>("/fee-details/my", { params });
    return response.data.data;
  },

  /**
   * Lấy thông tin chi tiết của một khoản phí cụ thể theo ID
   * GET /api/fee-details/{id}
   */
  getFeeDetailById: async (feeDetailId: string): Promise<FeeDetailResponse> => {
    const response = await apiClient.get<ApiResponse<FeeDetailResponse>>(`/fee-details/${feeDetailId}`);
    return response.data.data;
  },

  /**
   * Admin tạo phí riêng lẻ cho một học sinh cụ thể
   * POST /api/fee-details
   */
  createFeeDetail: async (payload: FeeDetailRequest): Promise<FeeDetailResponse> => {
    const response = await apiClient.post<ApiResponse<FeeDetailResponse>>("/fee-details", payload);
    return response.data.data;
  },

  /**
   * Admin cập nhật thông tin phí chi tiết (miễn giảm, điều chỉnh số tiền)
   * PATCH /api/fee-details/{id}
   */
  updateFeeDetail: async (
    feeDetailId: string,
    payload: UpdateFeeDetailRequest
  ): Promise<FeeDetailResponse> => {
    const response = await apiClient.patch<ApiResponse<FeeDetailResponse>>(
      `/fee-details/${feeDetailId}`,
      payload
    );
    return response.data.data;
  },
};

