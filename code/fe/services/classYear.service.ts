import {
  AssignStudentPayload,
  ClassYearResponse,
  ClassYearSummary,
  CreateClassYearPayload,
  GetClassYearsParams,
  ClassPromoteRequest,
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
    const backendParams: any = {};
    if (params?.schoolYear) {
      backendParams.SchoolYear = typeof params.schoolYear === 'string' 
        ? parseInt(params.schoolYear.split("-")[0], 10) 
        : params.schoolYear;
    }
    if (params?.grade) {
      backendParams.Grade = params.grade;
    }
    if (params?.className) {
      backendParams.ClassName = params.className;
    }
    if (params?.sortOrder) {
      backendParams.IsAscending = params.sortOrder === 'asc';
    }
    if (params?.page) backendParams.PageNumber = params.page;
    if (params?.pageSize) backendParams.PageSize = params.pageSize;
    if (params?.sortBy) backendParams.SortBy = params.sortBy;
    const response = await apiClient.get<any>("/class-years", { params: backendParams });
    // Handle PagedResponse structure { items: [], totalCount: n }
    const data = response.data;
    return Array.isArray(data) ? data : (data?.items || []);
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
      backendParams.SchoolYear = typeof params.schoolYear === 'string'
        ? parseInt((params.schoolYear as string).split("-")[0], 10)
        : params.schoolYear;
      delete backendParams.schoolYear;
    }
    const response = await apiClient.get<any>("/class-years/teaching", {
      params: backendParams,
    });
    const data = response.data;
    return Array.isArray(data) ? data : (data?.items || []);
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
      backendParams.SchoolYear = typeof params.schoolYear === 'string'
        ? parseInt((params.schoolYear as string).split("-")[0], 10)
        : params.schoolYear;
      delete backendParams.schoolYear;
    }
    const response = await apiClient.get<any>(
      `/class-years/by-teacher/${teacherId}`,
      { params: backendParams }
    );
    const data = response.data;
    return Array.isArray(data) ? data : (data?.items || []);
  },

  // ─── TEACHER: GET HOMEROOM CLASS ──────────────────────────────────────────────
  /**
   * Teacher retrieves their own homeroom class.
   * GET /class-years/homeroom
   * AuthN(login) + AuthZ(Teacher)
   * 404: teacher does not have a homeroom class
   */
  getHomeroomClass: async (schoolYear?: number): Promise<ClassYearResponse> => {
    const params = schoolYear ? { SchoolYear: schoolYear } : {};
    const response = await apiClient.get<ClassYearResponse>("/class-years/homeroom", { params });
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
      schoolYear: typeof payload.schoolYear === 'string' 
        ? parseInt((payload.schoolYear as string).split("-")[0], 10)
        : payload.schoolYear,
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
      const yearStr = String(payload.schoolYear).split("-")[0];
      backendPayload.SchoolYear = parseInt(yearStr, 10);
      backendPayload.schoolYear = backendPayload.SchoolYear;
    }

    const response = await apiClient.put<ClassYearResponse>(
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
  promote: async (payload: ClassPromoteRequest): Promise<void> => {
    const backendPayload = {
      CurrentSystemYear: payload.currentSystemYear,
      ClassPromotes: payload.classPromotes.map(p => ({
        FromClassYearId: p.fromClassYearId,
        ToClassYearId: p.toClassYearId
      }))
    };
    await apiClient.post("/class-years/promote", backendPayload);
  },
};
