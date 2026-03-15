import {
  CreateExamScheduleDetailPayload,
  CreateExamSchedulePayload,
  ExamScheduleDetailResponse,
  ExamScheduleResponse,
  GetExamSchedulesParams,
  UpdateExamScheduleDetailPayload,
  UpdateExamSchedulePayload,
} from "../types/examSchedule";
import apiClient from "./apiClient";

export const examScheduleService = {
  // ─── LIST ─────────────────────────────────────────────────────────────────────
  /**
   * Lấy danh sách lịch thi (học sinh / giáo viên / admin)
   * GET /exam-schedules?grade=&schoolYear=&term=&teacherId=
   * AuthN(login)
   */
  getExamSchedules: async (params?: GetExamSchedulesParams): Promise<ExamScheduleResponse[]> => {
    const response = await apiClient.get<ExamScheduleResponse[]>("/exam-schedules", { params });
    return response.data;
  },

  // ─── GET DETAILS ──────────────────────────────────────────────────────────────
  /**
   * Lấy chi tiết lịch thi theo id lịch tổng
   * GET /exam-schedules/{id}/details
   * AuthN(login)
   * 404: lịch không tồn tại
   */
  getExamScheduleDetails: async (
    examScheduleId: string
  ): Promise<ExamScheduleDetailResponse[]> => {
    const response = await apiClient.get<ExamScheduleDetailResponse[]>(
      `/exam-schedules/${examScheduleId}/details`
    );
    return response.data;
  },

  // ─── ADMIN: CREATE SCHEDULE ───────────────────────────────────────────────────
  /**
   * Admin tạo lịch thi
   * POST /exam-schedules
   * AuthN(login) + AuthZ(Admin)
   */
  createExamSchedule: async (
    payload: CreateExamSchedulePayload
  ): Promise<ExamScheduleResponse> => {
    const response = await apiClient.post<ExamScheduleResponse>("/exam-schedules", payload);
    return response.data;
  },

  // ─── ADMIN: CREATE SCHEDULE DETAIL ───────────────────────────────────────────
  /**
   * Admin tạo chi tiết lịch thi (từng môn thi)
   * POST /exam-schedules/{id}/details
   * AuthN(login) + AuthZ(Admin)
   * 409: trùng phòng thi / giáo viên / môn thi cùng giờ
   */
  createExamScheduleDetail: async (
    examScheduleId: string,
    payload: CreateExamScheduleDetailPayload
  ): Promise<ExamScheduleDetailResponse> => {
    const response = await apiClient.post<ExamScheduleDetailResponse>(
      `/exam-schedules/${examScheduleId}/details`,
      payload
    );
    return response.data;
  },

  // ─── ADMIN: UPDATE SCHEDULE ───────────────────────────────────────────────────
  /**
   * Admin sửa lịch thi
   * PATCH /exam-schedules/{id}
   * AuthN(login) + AuthZ(Admin)
   */
  updateExamSchedule: async (
    examScheduleId: string,
    payload: UpdateExamSchedulePayload
  ): Promise<ExamScheduleResponse> => {
    const response = await apiClient.patch<ExamScheduleResponse>(
      `/exam-schedules/${examScheduleId}`,
      payload
    );
    return response.data;
  },

  // ─── ADMIN: UPDATE SCHEDULE DETAIL ───────────────────────────────────────────
  /**
   * Admin sửa chi tiết lịch thi
   * PATCH /exam-schedules/details/{id}
   * AuthN(login) + AuthZ(Admin)
   */
  updateExamScheduleDetail: async (
    detailId: string,
    payload: UpdateExamScheduleDetailPayload
  ): Promise<ExamScheduleDetailResponse> => {
    const response = await apiClient.patch<ExamScheduleDetailResponse>(
      `/exam-schedules/details/${detailId}`,
      payload
    );
    return response.data;
  },
};
