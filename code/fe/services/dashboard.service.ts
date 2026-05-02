import apiClient from "./apiClient";
import { DashboardStats } from "../types/dashboard";

export const dashboardService = {
  getStats: async (schoolYear: number): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>("/dashboard/stats", {
      params: { schoolYear },
    });
    return response.data;
  },
};
