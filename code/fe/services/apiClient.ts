import axios, {
   AxiosError,
   AxiosResponse,
   InternalAxiosRequestConfig,
} from "axios";
import Constants from "expo-constants";
import { useAuthStore } from "../store/authStore";
import { Alert } from "react-native";
import { router } from "expo-router";

const API_URL = Constants.expoConfig?.extra?.apiUrl;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  },
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Handle 401 & Refresh Token
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const customStatus = response.data?.statusCode;
    // Handle enveloped error responses
    if (customStatus && customStatus >= 50400) {
      console.log('Backend error response data:', JSON.stringify(response.data, null, 2));
      
      // The message could be in response.data.message or response.data.data.message
      const errorMessage = response.data?.message || response.data?.data?.message || "Lỗi API";
      
      // Create a fake AxiosError to trigger the catch block below or in services
      const error: any = new Error(errorMessage);
      error.response = {
        ...response,
        status: customStatus - 50000, // Revert back to original HTTP code e.g. 401, 404, 500
        data: response.data.data
      };
      error.config = response.config;
      return Promise.reject(error);
    }
    
    // Return only the inner data if it's enveloped
    if (response.data && response.data.hasOwnProperty('statusCode')) {
       response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const { refreshToken, setAuth, clearAuth } = useAuthStore.getState();

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      if (isRefreshing) {
        // Enqueue the request while refresh is in progress
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call refresh endpoint directly with axios to avoid circular dependency
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;
        const newFirebaseToken = response.data.firebaseToken || useAuthStore.getState().firebaseToken;

        // Optionally update user info if returned
        const currentUserInfo = useAuthStore.getState().userInfo;

        // Save new tokens to store
        await setAuth(
          newAccessToken,
          newRefreshToken,
          newFirebaseToken || null,
          currentUserInfo || undefined,
        );

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        // Force logout if refresh fails
        await clearAuth();

        // Only show alert if it's not a missing token error (which happens during manual logout)
        if (refreshError?.message !== "No refresh token available") {
          Alert.alert("Phiên đăng nhập hết hạn", "Vui lòng đăng nhập lại để tiếp tục.");
        }
        
        router.replace("/login");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response) {
      console.log('API Error Response:', error.response.status, error.response.data, 'URL:', error.config?.url);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
