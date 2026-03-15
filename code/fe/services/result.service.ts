import {
  ClassResultItem,
  CreateResultEntry,
  GetClassResultsParams,
  GetStudentResultsParams,
  ResultItem,
  StudentResultSubject,
  UpdateResultPayload,
} from "../types/result";
import apiClient from "./apiClient";

export const resultService = {
  // ─── TEACHER: CREATE (bulk) ───────────────────────────────────────────────────
  /**
   * Giáo viên thêm điểm cho nhiều học sinh cùng lúc
   * POST /results
   * AuthN(login) + AuthZ(Teacher)
   * 404: studentId / subjectId không tồn tại
   */
  createResults: async (entries: CreateResultEntry[]): Promise<ResultItem[]> => {
    const response = await apiClient.post<ResultItem[]>("/results", entries);
    return response.data;
  },

  // ─── TEACHER: UPDATE ──────────────────────────────────────────────────────────
  /**
   * Giáo viên sửa điểm
   * PATCH /results/{id}
   * AuthN(login) + AuthZ(Teacher)
   */
  updateResult: async (resultId: string, payload: UpdateResultPayload): Promise<ResultItem> => {
    const response = await apiClient.patch<ResultItem>(`/results/${resultId}`, payload);
    return response.data;
  },

  // ─── STUDENT: GET MY RESULTS ──────────────────────────────────────────────────
  /**
   * Học sinh xem bảng điểm cá nhân theo kì/năm (gom theo môn)
   * GET /results/student/{studentId}?term=&schoolYear=
   * AuthN(login) + AuthZ(Student)
   */
  getStudentResults: async (
    studentId: string,
    params?: GetStudentResultsParams
  ): Promise<StudentResultSubject[]> => {
    const response = await apiClient.get<StudentResultSubject[]>(
      `/results/student/${studentId}`,
      { params }
    );
    return response.data;
  },

  // ─── TEACHER: GET CLASS RESULTS ───────────────────────────────────────────────
  /**
   * Giáo viên xem bảng điểm theo lớp / môn / kì / năm
   * GET /results/class?classYearId=&subjectId=&term=&schoolYear=
   * AuthN(login) + AuthZ(Teacher)
   */
  getClassResults: async (params: GetClassResultsParams): Promise<ClassResultItem[]> => {
    const response = await apiClient.get<ClassResultItem[]>("/results/class", { params });
    return response.data;
  },
};
