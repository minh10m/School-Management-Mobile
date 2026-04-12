import { ApiResponse, PagedResponse } from "../types/common";
import {
  ExamScheduleDetailFilterRequest,
  ExamScheduleDetailResponse,
  ExamScheduleFilterRequest,
  ExamScheduleRequest,
  ExamScheduleResponse,
  ExamStudentAssignmentFilterRequest,
  ExamStudentAssignmentResponse,
  UpdateExamScheduleDetail,
  MyExamScheduleDetailRequest,
  MyExamScheduleDetailResponse,
} from "../types/examSchedule";
import apiClient from "./apiClient";

export const examScheduleService = {
  // ─── ADMIN: SCHEDULES ────────────────────────────────────────────────────────
  
  /**
   * Lấy danh sách lịch thi (Admin)
   * GET /api/exam-schedules/all
   */
  getAllSchedules: async (params: ExamScheduleFilterRequest): Promise<PagedResponse<ExamScheduleResponse>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<ExamScheduleResponse>>>("/exam-schedules/all", { params });
    return response.data.data;
  },

  /**
   * Tạo lịch thi mới
   * POST /api/exam-schedules
   */
  createSchedule: async (payload: ExamScheduleRequest): Promise<ExamScheduleResponse> => {
    const response = await apiClient.post<ApiResponse<ExamScheduleResponse>>("/exam-schedules", payload);
    return response.data.data;
  },

  /**
   * Cập nhật lịch thi
   * PATCH /api/exam-schedules/{id}
   */
  updateSchedule: async (id: string, payload: ExamScheduleRequest): Promise<ExamScheduleResponse> => {
    const response = await apiClient.patch<ApiResponse<ExamScheduleResponse>>(`/exam-schedules/${id}`, payload);
    return response.data.data;
  },

  // ─── ADMIN: DETAILS (EXAM SLOTS) ──────────────────────────────────────────

  /**
   * Lấy chi tiết các môn thi trong một lịch thi (Paginated)
   * GET /api/exam-schedules/{id}/details
   */
  getScheduleDetails: async (
    id: string,
    params: ExamScheduleDetailFilterRequest
  ): Promise<PagedResponse<ExamScheduleDetailResponse>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<ExamScheduleDetailResponse>>>(
      `/exam-schedules/${id}/details`,
      { params }
    );
    return response.data.data;
  },

  /**
   * Import chi tiết lịch thi từ file Excel
   * POST /api/exam-schedules/{id}/details
   */
  uploadExcel: async (id: string, fileUri: string): Promise<boolean> => {
    const formData = new FormData();
    // @ts-ignore
    formData.append("file", {
      uri: fileUri,
      name: "exam_schedule.xlsx",
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const response = await apiClient.post<ApiResponse<boolean>>(
      `/exam-schedules/${id}/details`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.data;
  },

  /**
   * Cập nhật một môn thi (slot)
   * PATCH /api/exam-schedules/details/{id}
   */
  updateDetail: async (id: string, payload: UpdateExamScheduleDetail): Promise<ExamScheduleDetailResponse> => {
    const response = await apiClient.patch<ApiResponse<ExamScheduleDetailResponse>>(
      `/exam-schedules/details/${id}`,
      payload
    );
    return response.data.data;
  },

  // ─── ADMIN: ASSIGNMENTS ──────────────────────────────────────────────────────

  /**
   * Kích hoạt tự động phân bổ học sinh vào phòng thi
   * POST /api/exam-schedules/{id}/details/assign
   */
  triggerAssignment: async (id: string): Promise<boolean> => {
    const response = await apiClient.post<ApiResponse<boolean>>(`/exam-schedules/${id}/details/assign`);
    return response.data.data;
  },

  /**
   * Xem danh sách học sinh được phân bổ vào một môn thi cụ thể
   * GET /api/exam-schedules/details/{id}/assign
   */
  getAssignments: async (
    detailId: string,
    params: ExamStudentAssignmentFilterRequest
  ): Promise<PagedResponse<ExamStudentAssignmentResponse>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<ExamStudentAssignmentResponse>>>(
      `/exam-schedules/details/${detailId}/assign`,
      { params }
    );
    return response.data.data;
  },
  /**
   * Xóa lịch thi
   * DELETE /api/exam-schedules/{id}
   */
  deleteSchedule: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/exam-schedules/${id}`);
    return response.data.data;
  },
  /**
   * Lấy lịch thi cá nhân (Dành cho Giáo viên gác thi hoặc Học sinh đi thi)
   * GET /api/exam-schedules
   */
  getMyExamSchedule: async (params: MyExamScheduleDetailRequest): Promise<MyExamScheduleDetailResponse[]> => {
    const response = await apiClient.get<ApiResponse<MyExamScheduleDetailResponse[]>>("/exam-schedules", { params });
    return response.data.data;
  },
};
