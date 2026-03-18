import { useAuthStore } from "@/features/auth/store/authStore";
import {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  SignupPayload,
} from "../types";

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    // ---- MOCK LOGIN ----
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Accept any username/password combination for now
    const mockResponse: AuthResponse = {
      accessToken: "mock_access_token_12345",
      refreshToken: "mock_refresh_token_67890",
      expiresIn: 3600,
      userInfo: {
        id: "admin_001",
        fullName: payload.username || "Mock Admin",
        email: "admin@school.app",
        role: "Admin",
      }
    };

    const { accessToken, refreshToken, userInfo } = mockResponse;

    // Save to store
    useAuthStore.getState().setAuth(accessToken, refreshToken, userInfo);

    return mockResponse;
    // --------------------

    /* Original real API code:
    const response = await apiClient.post<AuthResponse>("/auth/login", payload);
    const { accessToken, refreshToken, userInfo } = response.data;
    useAuthStore.getState().setAuth(accessToken, refreshToken, userInfo);
    return response.data;
    */
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  signup: async (payload: SignupPayload): Promise<any> => {
    // MOCK SIGNUP
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true };
    /*
    const response = await apiClient.post("/auth/register", payload);
    return response.data;
    */
  },

  logout: async (): Promise<void> => {
    // MOCK LOGOUT
    useAuthStore.getState().clearAuth();
    /*
    try {
      const { refreshToken } = useAuthStore.getState();
      if (refreshToken) {
        await apiClient.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.error("Logout API failed, clearing local data anyway", error);
    } finally {
      // Always clear local auth state regardless of API success
      useAuthStore.getState().clearAuth();
    }
    */
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    // MOCK CHANGE PASSWORD
    await new Promise(resolve => setTimeout(resolve, 800));
    /*
    // Requires user to be logged in (token will be attached automatically by interceptor)
    await apiClient.patch("/auth/change-password", payload);
    */
  },
};
