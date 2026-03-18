import { create } from "zustand";
import Cookies from "js-cookie";
import { UserInfo } from "../types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userInfo: UserInfo | null;
  isLoading: boolean;
  setAuth: (
    accessToken: string,
    refreshToken: string,
    userInfo?: UserInfo,
  ) => void;
  clearAuth: () => void;
  loadAuthFromStorage: () => void;
}

const COOKIE_ACCESS_TOKEN_KEY = "ACCESS_TOKEN";
const COOKIE_REFRESH_TOKEN_KEY = "REFRESH_TOKEN";
const LOCAL_STORAGE_USER_INFO_KEY = "USER_INFO";

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  userInfo: null,
  isLoading: true, // Initially true while we load from storage

  setAuth: (accessToken: string, refreshToken: string, userInfo?: UserInfo) => {
    // Save to memory
    set({ accessToken, refreshToken, userInfo, isLoading: false });

    // Save tokens to cookies (HttpOnly should ideally be used via Next.js api routes, but for client-side compat like FE:)
    Cookies.set(COOKIE_ACCESS_TOKEN_KEY, accessToken, { secure: true, sameSite: 'strict' });
    Cookies.set(COOKIE_REFRESH_TOKEN_KEY, refreshToken, { secure: true, sameSite: 'strict' });
    
    // Save user info to local storage
    if (typeof window !== "undefined" && userInfo) {
      localStorage.setItem(LOCAL_STORAGE_USER_INFO_KEY, JSON.stringify(userInfo));
    }
  },

  clearAuth: () => {
    // Clear memory
    set({
      accessToken: null,
      refreshToken: null,
      userInfo: null,
      isLoading: false,
    });

    // Clear Cookies and LocalStorage
    Cookies.remove(COOKIE_ACCESS_TOKEN_KEY);
    Cookies.remove(COOKIE_REFRESH_TOKEN_KEY);
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_STORAGE_USER_INFO_KEY);
    }
  },

  loadAuthFromStorage: () => {
    set({ isLoading: true });
    
    // Read from cookies
    const accessToken = Cookies.get(COOKIE_ACCESS_TOKEN_KEY) || null;
    const refreshToken = Cookies.get(COOKIE_REFRESH_TOKEN_KEY) || null;
    
    let userInfo = null;
    if (typeof window !== "undefined") {
      const userInfoStr = localStorage.getItem(LOCAL_STORAGE_USER_INFO_KEY);
      if (userInfoStr) {
        try {
          userInfo = JSON.parse(userInfoStr);
        } catch (e) {
          console.error("Failed to parse USER_INFO from LocalStorage:", e);
        }
      }
    }

    if (accessToken && refreshToken) {
      set({ accessToken, refreshToken, userInfo, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },
}));
