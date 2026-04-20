import {
  ClassAttendanceItem,
  GetClassAttendanceParams,
  GetStudentAttendanceParams,
  GetWeeklyAttendanceParams,
  StudentAttendanceResponse,
  SubmitAttendancePayload,
  SubmitAttendanceResponse,
  WeeklyAttendanceResponse,
} from "../types/attendance";
import apiClient from "./apiClient";

export const attendanceService = {
  // ─── TEACHER: SUBMIT / UPDATE ATTENDANCE ──────────────────────────────────────
  /**
   * Teacher takes attendance or updates attendance records for the entire class.
   * - INSERT if record doesn't exist
   * - UPDATE if record already exists
   * AuthN(login) + AuthZ(Teacher)
   * 400: Invalid data format
   * 404: classYear or student not found
   * 409: Teacher is not the homeroom teacher for this class
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
   * Teacher retrieves student list + attendance status for a specific date.
   * (null = not attended yet -> display dropdown for selection)
   * AuthN(login) + AuthZ(Teacher)
   * 400: Missing classYearId or date
   * 404: classYear doesn't exist
   * 409: Teacher is not the homeroom teacher
   */
  getClassAttendance: async (
    params: GetClassAttendanceParams
  ): Promise<ClassAttendanceItem[]> => {
    const response = await apiClient.get<ClassAttendanceItem[]>("/attendances/class", {
      params,
    });
    return response.data;
  },

  // ─── TEACHER: GET WEEKLY ATTENDANCE STATISTICS ───────────────────────────────
  /**
   * Teacher views weekly attendance statistics for all students in their homeroom class.
   * AuthN(login) + AuthZ(Teacher)
   */
  getWeeklyAttendance: async (
    params: GetWeeklyAttendanceParams
  ): Promise<WeeklyAttendanceResponse[]> => {
    // Backend expects ClassYearId and StartDate with capital first letter
    const backendParams = {
      ClassYearId: params.classYearId,
      StartDate: params.startDate,
    };
    const response = await apiClient.get<WeeklyAttendanceResponse[]>(
      "/attendances/weekly",
      { params: backendParams }
    );
    return response.data;
  },

  // ─── STUDENT: GET MY ATTENDANCE HISTORY ──────────────────────────────────────
  /**
   * Student views their own attendance history for a specific month/year.
   * AuthN(login) + AuthZ(Student)
   * 404: student not found
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
