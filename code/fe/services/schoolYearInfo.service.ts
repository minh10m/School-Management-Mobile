import apiClient from "./apiClient";

export interface SchoolYearInfo {
  id: string;
  term: number;
  schoolYear: number;
}

export interface SchoolYearInfoRequest {
  term: number;
  schoolYear: number;
}

export const schoolYearInfoService = {
  getSchoolYearInfo: async (): Promise<SchoolYearInfo | null> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: SchoolYearInfo }>(
        "/school-year-info"
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching school year info:", error);
      return null;
    }
  },

  updateSchoolYearInfo: async (
    id: string,
    data: SchoolYearInfoRequest
  ): Promise<SchoolYearInfo> => {
    const response = await apiClient.patch<{ success: boolean; data: SchoolYearInfo }>(
      `/school-year-info/${id}`,
      data
    );
    return response.data.data;
  },

  createSchoolYearInfo: async (
    data: SchoolYearInfoRequest
  ): Promise<SchoolYearInfo> => {
    const response = await apiClient.post<{ success: boolean; data: SchoolYearInfo }>(
      "/school-year-info",
      data
    );
    return response.data.data;
  },
};
