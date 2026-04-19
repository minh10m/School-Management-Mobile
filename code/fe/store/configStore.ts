import { create } from "zustand";
import { schoolYearInfoService } from "../services/schoolYearInfo.service";

interface ConfigState {
  schoolYear: number;
  term: number;
  isLoading: boolean;
  loadConfig: () => Promise<void>;
  updateConfig: (schoolYear: number, term: number) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  schoolYear: 2026, // Default fallback
  term: 1, // Default fallback
  isLoading: true,

  loadConfig: async () => {
    set({ isLoading: true });
    try {
      const data = await schoolYearInfoService.getSchoolYearInfo();
      if (data) {
        set({ 
          schoolYear: data.schoolYear, 
          term: data.term,
          isLoading: false 
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Error loading school configuration:", error);
      set({ isLoading: false });
    }
  },

  updateConfig: (schoolYear: number, term: number) => {
    set({ schoolYear, term });
  },
}));
