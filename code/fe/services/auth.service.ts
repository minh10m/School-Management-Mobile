import { useAuthStore } from "../store/authStore";
import {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
} from "../types/auth";
import apiClient from "./apiClient";
import { userService } from "./user.service";
import { teacherService } from "./teacher.service";
import { studentService } from "./student.service";

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", payload);
    const data = response.data;

    const initialUserInfo = {
      id: data.userId,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      avatarUrl: data.avatarUrl,
    };

    const authStore = useAuthStore.getState();
    await authStore.setAuth(data.accessToken, data.refreshToken, data.firebaseToken || null, initialUserInfo);

    // Fetch full profile based on role to get missing details (like avatarUrl if it wasn't in login)
    try {
      let fullProfile: any = null;
      const role = data.role.toLowerCase();
      
      if (role === 'admin') {
        fullProfile = await userService.getMe();
      } else if (role === 'teacher') {
        fullProfile = await teacherService.getMe();
      } else {
        fullProfile = await studentService.getMe();
      }

      if (fullProfile) {
        await authStore.updateUserInfo({
          fullName: fullProfile.fullName,
          avatarUrl: fullProfile.avatarUrl
        });
      }
    } catch (err) {
      console.log("Could not fetch full profile after login:", err);
    }

    return data;
  },

  logout: async (): Promise<void> => {
    try {
      const { refreshToken } = useAuthStore.getState();
      if (refreshToken) {
        await apiClient.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.log("Logout API failed, clearing local data anyway", error);
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
