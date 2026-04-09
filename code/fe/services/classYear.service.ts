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
   * Retrieves a list of classes by school year and/or grade (Admin only).
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
   * Retrieves class information by ID.
   * GET /class-years/{id}
   * AuthN(login)
   * 404: classYear does not exist
   */
  getClassYearById: async (classYearId: string): Promise<ClassYearResponse> => {
    const response = await apiClient.get<ClassYearResponse>(`/class-years/${classYearId}`);
    return response.data;
  },

  // ─── TEACHER: GET MY TEACHING CLASSES ────────────────────────────────────────
  /**
   * Teacher retrieves the list of classes they are teaching (not homeroom).
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
   * Retrieves the list of classes taught by a specific teacher (used for teacher profiles).
   * GET /class-years/by-teacher/{teacherId}?schoolYear=&grade=
   * AuthN(login)
   * 404: teacher does not exist
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
   * Teacher retrieves their own homeroom class.
   * GET /class-years/homeroom
   * AuthN(login) + AuthZ(Teacher)
   * 404: teacher does not have a homeroom class
   */
  getHomeroomClass: async (): Promise<ClassYearResponse> => {
    const response = await apiClient.get<ClassYearResponse>("/class-years/homeroom");
    return response.data;
  },

  // ─── STUDENT: GET MY CLASS ────────────────────────────────────────────────────
  /**
   * Student retrieves information for the class they are currently enrolled in.
   * GET /class-years/my-class
   * AuthN(login) + AuthZ(Student)
   * 404: student has not been assigned to a class
   */
  getMyClass: async (schoolYear?: number): Promise<ClassYearResponse> => {
    const params = schoolYear ? { SchoolYear: schoolYear } : {};
    const response = await apiClient.get<ClassYearResponse>("/class-years/my-class", { params });
    return response.data;
  },

  // ─── ADMIN: CREATE ────────────────────────────────────────────────────────────
  /**
   * Admin creates a new class.
   * POST /class-years
   * AuthN(login) + AuthZ(Admin)
   * 400: Invalid data format
   * 404: Teacher does not exist
   * 409: Class already exists in the given school year
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
   * Admin updates class information.
   * PATCH /class-years/{id}
   * AuthN(login) + AuthZ(Admin)
   * 404: classYear or teacher does not exist
   * 409: className is duplicated
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

  assignStudent: async (classYearId: string, payload: AssignStudentPayload): Promise<void> => {
    await apiClient.post(`/class-years/${classYearId}/students`, payload);
  },

  // ─── ADMIN: PROMOTE ───────────────────────────────────────────────────────────
  /**
   * Admin promotes students from old classes to new classes (using a mapping list).
   * POST /class-years/promote
   * AuthN(login) + AuthZ(Admin)
   * 404: classYear does not exist
   * 409: Incompatible grades for promotion (e.g., must be 10→11, 11→12)
   */
  promote: async (mappings: PromoteClassPayload[]): Promise<void> => {
    await apiClient.post("/class-years/promote", mappings);
  },
};
