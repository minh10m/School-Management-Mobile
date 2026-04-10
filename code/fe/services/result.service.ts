import {
  CreateResultRequest,
  GetClassResultsParams,
  GetStudentResultsParams,
  ResultItem,
  StudentResultSubject,
  StudentResultForTeacherResponse,
  UpdateResultPayload,
} from "../types/result";
import apiClient from "./apiClient";

export const resultService = {
  // ─── TEACHER: CREATE (bulk) ───────────────────────────────────────────────────
  /**
   * Giáo viên thêm điểm cho nhiều học sinh cùng lúc
   * POST /results
   * AuthN(login) + AuthZ(Teacher)
   */
  createResults: async (entries: CreateResultRequest[]): Promise<any> => {
    const response = await apiClient.post<any>("/results", entries);
    return response.data;
  },

  // ─── TEACHER: UPDATE ──────────────────────────────────────────────────────────
  /**
   * Giáo viên sửa điểm
   * PATCH /results/{id}
   * AuthN(login) + AuthZ(Teacher)
   */
  updateResult: async (resultId: string, payload: UpdateResultPayload): Promise<ResultItem> => {
    const response = await apiClient.patch<any>(`/results/${resultId}`, payload);
    return response.data.data;
  },

  // ─── STUDENT: GET MY RESULTS ──────────────────────────────────────────────────
  /**
   * Học sinh xem bảng điểm cá nhân theo kì/năm (gom theo môn)
   * GET /results/student?Term=&SchoolYear=
   * AuthN(login) + AuthZ(Student)
   */
  getStudentResults: async (
    params?: GetStudentResultsParams
  ): Promise<StudentResultSubject[]> => {
    const response = await apiClient.get<any>("/results/student", { params });
    return response.data.data;
  },

  // ─── TEACHER: GET CLASS RESULTS ───────────────────────────────────────────────
  /**
   * Giáo viên xem bảng điểm của tất cả học sinh trong lớp
   * GET /results/class/{classYearId}?term=
   * AuthN(login) + AuthZ(Teacher)
   */
  getClassResults: async (classYearId: string, params: GetClassResultsParams): Promise<StudentResultForTeacherResponse[]> => {
    const response = await apiClient.get<any>(`/results/class/${classYearId}`, { params });
    return response.data.data;
  },

  // ─── TEACHER: GET ONE STUDENT RESULTS ─────────────────────────────────────────
  /**
   * Giáo viên xem bảng điểm chi tiết của một học sinh
   * GET /results/class/{classYearId}/student/{studentId}?term=
   * AuthN(login) + AuthZ(Teacher)
   */
  getOneStudentResultForTeacher: async (classYearId: string, studentId: string, params: GetClassResultsParams): Promise<StudentResultSubject[]> => {
    const response = await apiClient.get<any>(`/results/class/${classYearId}/student/${studentId}`, { params });
    return response.data.data;
  },
};
