import { useAuthStore } from "../store/authStore";
import {
   AuthResponse,
   ChangePasswordPayload,
   LoginPayload,
   SignupPayload,
} from "../types/auth";
import apiClient from "./apiClient";

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", payload);
    const { accessToken, refreshToken, userInfo } = response.data;

    // Save to store
    await useAuthStore.getState().setAuth(accessToken, refreshToken, userInfo);

    return response.data;
  },

  // Mocking signup since your provided API didn't include it explicitly,
  // but we can structure it similarly. Adjust endpoint as needed.
  signup: async (payload: SignupPayload): Promise<any> => {
    const response = await apiClient.post("/auth/register", payload); // Adjust endpoint based on real API
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      const { refreshToken } = useAuthStore.getState();
      if (refreshToken) {
        await apiClient.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.error("Logout API failed, clearing local data anyway", error);
    } finally {
      // Always clear local auth state regardless of API success
      await useAuthStore.getState().clearAuth();
    }
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    // Requires user to be logged in (token will be attached automatically by interceptor)
    await apiClient.patch("/auth/change-password", payload);
  },
};
