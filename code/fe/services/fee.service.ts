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

// ─── FEE SERVICE ──────────────────────────────────────────────────────────────

export const feeService = {
  /**
   * Admin lấy danh sách phí trong năm học
   * GET /api/fees
   */
  getFees: async (params: FeeFilterRequest): Promise<PagedResponse<FeeResponse>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<FeeResponse>>>("/fees", { params });
    return response.data.data;
  },

  /**
   * Admin lấy thông tin chi tiết của một loại phí theo ID
   * GET /api/fees/{id}
   */
  getFeeById: async (feeId: string): Promise<FeeResponse> => {
    const response = await apiClient.get<ApiResponse<FeeResponse>>(`/fees/${feeId}`);
    return response.data.data;
  },

  /**
   * Admin xem danh sách học sinh và trạng thái đóng phí của một loại phí
   * GET /api/fees/details
   */
  getAllFeeDetails: async (params: FeeDetailFilterRequest): Promise<PagedResponse<FeeDetailResponse>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<FeeDetailResponse>>>("/fees/details", { params });
    return response.data.data;
  },

  /**
   * Admin tạo phí cho một lớp
   * POST /api/fees
   */
  createFee: async (payload: CreateFeeRequest): Promise<FeeResponse> => {
    const response = await apiClient.post<ApiResponse<FeeResponse>>("/fees", payload);
    return response.data.data;
  },

  /**
   * Admin sửa thông tin phí
   * PATCH /api/fees/{id}
   */
  updateFee: async (feeId: string, payload: UpdateFeeRequest): Promise<FeeResponse> => {
    const response = await apiClient.patch<ApiResponse<FeeResponse>>(`/fees/${feeId}`, payload);
    return response.data.data;
  },
};

// ─── FEE DETAIL SERVICE ────────────────────────────────────────────────────────

export const feeDetailService = {
  /**
   * Học sinh xem danh sách các loại phí của mình
   * GET /api/fee-details/my
   */
  getMyFees: async (params: MyFeeDetailFilterRequest): Promise<PagedResponse<FeeDetailResponse>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<FeeDetailResponse>>>("/fee-details/my", { params });
    return response.data.data;
  },

  /**
   * Xem chi tiết một phí theo id
   * GET /api/fee-details/{id}
   */
  getFeeDetailById: async (feeDetailId: string): Promise<FeeDetailResponse> => {
    const response = await apiClient.get<ApiResponse<FeeDetailResponse>>(`/fee-details/${feeDetailId}`);
    return response.data.data;
  },

  /**
   * Admin tạo phí riêng lẻ cho một học sinh
   * POST /api/fee-details
   */
  createFeeDetail: async (payload: FeeDetailRequest): Promise<FeeDetailResponse> => {
    const response = await apiClient.post<ApiResponse<FeeDetailResponse>>("/fee-details", payload);
    return response.data.data;
  },

  /**
   * Admin miễn giảm phí cho học sinh (thay đổi amountDue)
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

