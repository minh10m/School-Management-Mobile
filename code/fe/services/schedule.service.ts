import {
  CreateScheduleDetailPayload,
  CreateSchedulePayload,
  GetMyClassScheduleParams,
  GetSchedulesParams,
  ScheduleDetailItem,
  ScheduleDetailResponse,
  ScheduleResponse,
  ScheduleSummaryListResponse,
  TeacherScheduleDetailItem,
  UpdateScheduleDetailPayload,
  UpdateSchedulePayload,
} from "../types/schedule";
import apiClient from "./apiClient";

export const scheduleService = {
  // ─── ADMIN: LIST ──────────────────────────────────────────────────────────────
  /**
   * Admin lấy danh sách lịch học của các lớp / giáo viên
   * GET /schedules?classYearId=&teacherId=&term=
   * AuthN(login) + AuthZ(Admin)
   */
  getSchedules: async (params?: GetSchedulesParams): Promise<ScheduleSummaryListResponse> => {
    const response = await apiClient.get<ScheduleSummaryListResponse>("/schedules", { params });
    return response.data;
  },

  // ─── ADMIN: GET DETAIL ────────────────────────────────────────────────────────
  /**
   * Admin lấy chi tiết lịch học của một schedule cụ thể
   * GET /schedules/{id}/details
   * AuthN(login) + AuthZ(Admin)
   * 404: schedule không tồn tại
   */
  getScheduleDetails: async (scheduleId: string): Promise<ScheduleDetailItem[]> => {
    const response = await apiClient.get<ScheduleDetailItem[]>(
      `/schedules/${scheduleId}/details`
    );
    return response.data;
  },

  // ─── ADMIN: CREATE SCHEDULE ───────────────────────────────────────────────────
  /**
   * Admin tạo lịch học mới cho lớp
   * POST /schedules
   * AuthN(login) + AuthZ(Admin)
   * 400: thiếu dữ liệu / sai format
   * 404: classYear không tồn tại
   * 409: lớp đã có schedule trong khoảng thời gian này
   */
  createSchedule: async (payload: CreateSchedulePayload): Promise<ScheduleResponse> => {
    const response = await apiClient.post<ScheduleResponse>("/schedules", payload);
    return response.data;
  },

  // ─── ADMIN: CREATE SCHEDULE DETAIL ───────────────────────────────────────────
  /**
   * Admin tạo chi tiết lịch (từng tiết học)
   * POST /schedules/{id}/details
   * AuthN(login) + AuthZ(Admin)
   * 404: schedule / teacherSubject không tồn tại
   * 409: trùng giờ dạy của giáo viên hoặc giờ học của lớp
   */
  createScheduleDetail: async (
    scheduleId: string,
    payload: CreateScheduleDetailPayload
  ): Promise<any> => {
    const response = await apiClient.post(`/schedules/${scheduleId}/details`, payload);
    return response.data;
  },

  // ─── ADMIN: UPDATE SCHEDULE ───────────────────────────────────────────────────
  /**
   * Admin sửa lịch học
   * PATCH /schedules/{id}
   * AuthN(login) + AuthZ(Admin)
   * 404: schedule / classYear không tồn tại
   */
  updateSchedule: async (
    scheduleId: string,
    payload: UpdateSchedulePayload
  ): Promise<ScheduleResponse> => {
    const response = await apiClient.patch<ScheduleResponse>(
      `/schedules/${scheduleId}`,
      payload
    );
    return response.data;
  },

  // ─── ADMIN: UPDATE SCHEDULE DETAIL ───────────────────────────────────────────
  /**
   * Admin sửa chi tiết lịch (một tiết cụ thể)
   * PATCH /schedules/details/{id}
   * AuthN(login) + AuthZ(Admin)
   * 404: schedule detail không tồn tại
   * 409: trùng giờ dạy / giờ học
   */
  updateScheduleDetail: async (
    scheduleId: string,
    payload: UpdateScheduleDetailPayload
  ): Promise<any> => {
    const response = await apiClient.put(`/schedules/${scheduleId}/details`, payload);
    return response.data;
  },

  // ─── ADMIN: DELETE SCHEDULE ───────────────────────────────────────────────────
  /**
   * Admin xóa lịch học
   * DELETE /schedules/{id}
   * AuthN(login) + AuthZ(Admin)
   */
  deleteSchedule: async (scheduleId: string): Promise<void> => {
    await apiClient.delete(`/schedules/${scheduleId}`);
  },

  deleteScheduleDetail: async (detailId: string): Promise<void> => {
    await apiClient.delete(`/schedules/details/${detailId}`);
  },

  // ─── STUDENT: GET MY CLASS SCHEDULE ──────────────────────────────────────────
  /**
   * Học sinh xem lịch học của lớp mình (cả tuần, theo thứ)
   * GET /schedules/classes/me
   * AuthN(login) + AuthZ(Student)
   * 404: class không tồn tại
   */
  getMyClassSchedule: async (params?: GetMyClassScheduleParams): Promise<ScheduleDetailItem[]> => {
    const response = await apiClient.get<ScheduleDetailItem[]>("/schedules/classes/me", { params });
    return response.data;
  },

  // ─── TEACHER: GET MY TEACHING SCHEDULE ───────────────────────────────────────
  /**
   * Giáo viên xem lịch dạy của bản thân (cả tuần)
   * GET /schedules/teachers/me
   * AuthN(login) + AuthZ(Teacher)
   * 404: teacher không tồn tại
   */
  getMyTeachingSchedule: async (params?: GetMyClassScheduleParams): Promise<TeacherScheduleDetailItem[]> => {
    const response = await apiClient.get<TeacherScheduleDetailItem[]>(
      "/schedules/teacher/me", { params }
    );
    return response.data;
  },
};
