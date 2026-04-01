import {
  AssignStudentPayload,
  ClassYearResponse,
  ClassYearSummary,
  CreateClassYearPayload,
  GetClassYearsParams,
  PromoteClassPayload,
  UpdateClassYearPayload,
} from "../types/classYear";
import apiClient from "./apiClient";

export const classYearService = {
  // ─── ADMIN: LIST ──────────────────────────────────────────────────────────────
  /**
   * Lấy danh sách lớp theo năm học / khối (dành cho admin)
   * GET /class-years?schoolYear=&grade=
   * AuthN(login) + AuthZ(Admin)
   */
  getClassYears: async (params?: GetClassYearsParams): Promise<ClassYearResponse[]> => {
    const backendParams: any = { ...params };
    if (params?.schoolYear) {
      backendParams.SchoolYear = parseInt(params.schoolYear.split("-")[0], 10);
      delete backendParams.schoolYear;
    }
    if (params?.sortOrder) {
      backendParams.IsAscending = params.sortOrder === 'asc';
      delete backendParams.sortOrder;
    }
    const response = await apiClient.get<ClassYearResponse[]>("/class-years", { params: backendParams });
    return response.data;
  },

  // ─── GET ONE ──────────────────────────────────────────────────────────────────
  /**
   * Lấy thông tin lớp theo id
   * GET /class-years/{id}
   * AuthN(login)
   * 404: classYear không tồn tại
   */
  getClassYearById: async (classYearId: string): Promise<ClassYearResponse> => {
    const response = await apiClient.get<ClassYearResponse>(`/class-years/${classYearId}`);
    return response.data;
  },

  // ─── TEACHER: GET MY TEACHING CLASSES ────────────────────────────────────────
  /**
   * Giáo viên xem danh sách lớp mình đang dạy (không phải lớp chủ nhiệm)
   * GET /class-years/teaching?schoolYear=&grade=
   * AuthN(login) + AuthZ(Teacher)
   */
  getTeachingClasses: async (params?: GetClassYearsParams): Promise<ClassYearSummary[]> => {
    const backendParams: any = { ...params };
    if (params?.schoolYear) {
      backendParams.SchoolYear = parseInt(params.schoolYear.split("-")[0], 10);
      delete backendParams.schoolYear;
    }
    const response = await apiClient.get<ClassYearSummary[]>("/class-years/teaching", {
      params: backendParams,
    });
    return response.data;
  },

  // ─── GET CLASSES BY TEACHER ID ────────────────────────────────────────────────
  /**
   * Xem danh sách lớp mà một giáo viên đang dạy (dùng khi xem profile giáo viên)
   * GET /class-years/by-teacher/{teacherId}?schoolYear=&grade=
   * AuthN(login)
   * 404: teacher không tồn tại
   */
  getClassesByTeacher: async (
    teacherId: string,
    params?: GetClassYearsParams
  ): Promise<ClassYearSummary[]> => {
    const backendParams: any = { ...params };
    if (params?.schoolYear) {
      backendParams.SchoolYear = parseInt(params.schoolYear.split("-")[0], 10);
      delete backendParams.schoolYear;
    }
    const response = await apiClient.get<ClassYearSummary[]>(
      `/class-years/by-teacher/${teacherId}`,
      { params: backendParams }
    );
    return response.data;
  },

  // ─── TEACHER: GET HOMEROOM CLASS ──────────────────────────────────────────────
  /**
   * Giáo viên lấy lớp chủ nhiệm của mình
   * GET /class-years/homeroom
   * AuthN(login) + AuthZ(Teacher)
   * 404: giáo viên không có lớp chủ nhiệm
   */
  getHomeroomClass: async (): Promise<ClassYearResponse> => {
    const response = await apiClient.get<ClassYearResponse>("/class-years/homeroom");
    return response.data;
  },

  // ─── STUDENT: GET MY CLASS ────────────────────────────────────────────────────
  /**
   * Học sinh lấy thông tin lớp mình đang học
   * GET /class-years/my-class
   * AuthN(login) + AuthZ(Student)
   * 404: học sinh chưa được gán lớp
   */
  getMyClass: async (): Promise<ClassYearResponse> => {
    const response = await apiClient.get<ClassYearResponse>("/class-years/my-class");
    return response.data;
  },

  // ─── ADMIN: CREATE ────────────────────────────────────────────────────────────
  /**
   * Admin tạo lớp mới
   * POST /class-years
   * AuthN(login) + AuthZ(Admin)
   * 400: dữ liệu sai format
   * 404: teacher không tồn tại
   * 409: lớp đã tồn tại trong năm học
   */
  createClassYear: async (payload: CreateClassYearPayload): Promise<ClassYearResponse> => {
    const backendPayload = {
      className: payload.className,
      grade: payload.grade,
      schoolYear: parseInt(payload.schoolYear.split("-")[0], 10),
      homeRoomId: payload.homeRoomId,
    };
    const response = await apiClient.post<ClassYearResponse>("/class-years", backendPayload);
    return response.data;
  },

  // ─── ADMIN: UPDATE ────────────────────────────────────────────────────────────
  /**
   * Admin sửa thông tin lớp
   * PATCH /class-years/{id}
   * AuthN(login) + AuthZ(Admin)
   * 404: classYear / teacher không tồn tại
   * 409: className bị trùng
   */
  updateClassYear: async (
    classYearId: string,
    payload: UpdateClassYearPayload
  ): Promise<ClassYearResponse> => {
    const backendPayload: any = { ...payload };
    if (payload.schoolYear) {
      backendPayload.schoolYear = parseInt(payload.schoolYear.split("-")[0], 10);
    }
    const response = await apiClient.patch<ClassYearResponse>(
      `/class-years/${classYearId}`,
      backendPayload
    );
    return response.data;
  },

  // ─── ADMIN: ASSIGN STUDENT ────────────────────────────────────────────────────
  /**
   * Admin gán học sinh vào lớp
   * POST /class-years/{id}/students
   * AuthN(login) + AuthZ(Admin)
   * 404: classYear / student không tồn tại
   * 409: học sinh đã có lớp trong năm học
   */
  assignStudent: async (classYearId: string, payload: AssignStudentPayload): Promise<void> => {
    // Backend API uses PATCH /students/{studentId}/classYear
    await apiClient.patch(`/students/${payload.studentId}/classYear`, { classYearId });
  },

  // ─── ADMIN: PROMOTE ───────────────────────────────────────────────────────────
  /**
   * Admin promote học sinh từ lớp cũ lên lớp mới (theo danh sách cặp lớp)
   * POST /class-years/promote
   * AuthN(login) + AuthZ(Admin)
   * 404: classYear không tồn tại
   * 409: lớp không cùng grade hợp lệ (chỉ 10→11, 11→12)
   */
  promote: async (mappings: PromoteClassPayload[]): Promise<void> => {
    await apiClient.post("/class-years/promote", mappings);
  },
};
