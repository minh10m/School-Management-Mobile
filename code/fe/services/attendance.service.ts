import {
  ClassAttendanceItem,
  GetClassAttendanceParams,
  GetStudentAttendanceParams,
  StudentAttendanceResponse,
  SubmitAttendancePayload,
  SubmitAttendanceResponse,
} from "../types/attendance";
import apiClient from "./apiClient";

export const attendanceService = {
  // ─── TEACHER: SUBMIT / UPDATE ATTENDANCE ──────────────────────────────────────
  /**
   * Giáo viên điểm danh (hoặc cập nhật điểm danh) cho cả lớp
   * - Nếu bản ghi chưa tồn tại → INSERT
   * - Nếu đã tồn tại → UPDATE
   * POST /attendances
   * AuthN(login) + AuthZ(Teacher)
   * 400: dữ liệu sai format
   * 404: classYear / student không tồn tại
   * 409: giáo viên không phải chủ nhiệm lớp
   */
  submitAttendance: async (
    payload: SubmitAttendancePayload
  ): Promise<SubmitAttendanceResponse> => {
    // Map frontend payload to match backend AttendanceRequest
    const backendPayload = {
      classYearId: payload.classYearId,
      date: payload.date,
      // Map attendances to infoAttendances
      infoAttendances: payload.attendances.map(a => ({
        studentId: a.studentId,
        status: a.status,
        note: a.note || null
      }))
    };

    const response = await apiClient.post<SubmitAttendanceResponse>(
      "/attendances",
      backendPayload
    );
    return response.data;
  },

  // ─── TEACHER: GET CLASS ATTENDANCE ────────────────────────────────────────────
  /**
   * Giáo viên xem danh sách học sinh + trạng thái điểm danh theo ngày
   * (null = chưa điểm danh → hiển thị dropdown để giáo viên chọn)
   * GET /attendances/class?classYearId={id}&date={YYYY-MM-DD}
   * AuthN(login) + AuthZ(Teacher)
   * 400: thiếu classYearId hoặc date
   * 404: classYear không tồn tại
   * 409: giáo viên không phải chủ nhiệm lớp
   */
  getClassAttendance: async (
    params: GetClassAttendanceParams
  ): Promise<ClassAttendanceItem[]> => {
    const response = await apiClient.get<ClassAttendanceItem[]>("/attendances/class", {
      params,
    });
    return response.data;
  },

  // ─── STUDENT: GET MY ATTENDANCE HISTORY ──────────────────────────────────────
  /**
   * Học sinh xem lịch sử điểm danh bản thân theo tháng/năm
   * GET /attendances/student/me?month={1-12}&year={yyyy}
   * AuthN(login) + AuthZ(Student)
   * 404: student không tồn tại
   */
  getMyAttendance: async (
    params?: GetStudentAttendanceParams
  ): Promise<StudentAttendanceResponse> => {
    // Backend expects Month and Year with capital first letter
    const backendParams = params ? {
      Month: params.month,
      Year: params.year,
    } : {};
    const response = await apiClient.get<StudentAttendanceResponse>(
      "/attendances/student/me",
      { params: backendParams }
    );
    return response.data;
  },
};
