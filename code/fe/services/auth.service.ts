import { useAuthStore } from "../store/authStore";
import {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
} from "../types/auth";
import apiClient from "./apiClient";

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", payload);
    const data = response.data;

    const userInfo = {
      id: data.userId,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
    };

    await useAuthStore
      .getState()
      .setAuth(data.accessToken, data.refreshToken, userInfo);

    return data;
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
    await apiClient.patch("/auth/change-password", {
      oldPassword: payload.oldPassword,
      newPassword: payload.newPassword,
      confirmPassword: payload.confirmedPassword,
    });
  },
};
