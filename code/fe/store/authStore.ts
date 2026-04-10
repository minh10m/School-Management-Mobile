import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { UserInfo } from "../types/auth";

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
  loadAuthFromStorage: () => Promise<void>;
}

const SECURE_STORE_ACCESS_TOKEN_KEY = "ACCESS_TOKEN";
const SECURE_STORE_REFRESH_TOKEN_KEY = "REFRESH_TOKEN";
const SECURE_STORE_USER_INFO_KEY = "USER_INFO";

export const useAuthStore = create<AuthState>((set: any) => ({
  accessToken: null,
  refreshToken: null,
  userInfo: null,
  isLoading: true, // Initially true while we load from storage

  setAuth: async (
    accessToken: string,
    refreshToken: string,
    userInfo?: UserInfo,
  ) => {
    // Save to memory
    set({ accessToken, refreshToken, userInfo, isLoading: false });

    // Save to SecureStore
    try {
      await SecureStore.setItemAsync(
        SECURE_STORE_ACCESS_TOKEN_KEY,
        accessToken,
      );
      await SecureStore.setItemAsync(
        SECURE_STORE_REFRESH_TOKEN_KEY,
        refreshToken,
      );
      if (userInfo) {
        await SecureStore.setItemAsync(
          SECURE_STORE_USER_INFO_KEY,
          JSON.stringify(userInfo),
        );
      }
    } catch (error) {
      console.error("Error saving auth to SecureStore:", error);
    }
  },

  clearAuth: async () => {
    // Clear memory
    set({
      accessToken: null,
      refreshToken: null,
      userInfo: null,
      isLoading: false,
    });

    // Clear SecureStore
    try {
      await SecureStore.deleteItemAsync(SECURE_STORE_ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(SECURE_STORE_REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(SECURE_STORE_USER_INFO_KEY);
    } catch (error) {
      console.error("Error clearing auth from SecureStore:", error);
    }
  },

  loadAuthFromStorage: async () => {
    set({ isLoading: true });
    try {
      const accessToken = await SecureStore.getItemAsync(
        SECURE_STORE_ACCESS_TOKEN_KEY,
      );
      const refreshToken = await SecureStore.getItemAsync(
        SECURE_STORE_REFRESH_TOKEN_KEY,
      );
      const userInfoStr = await SecureStore.getItemAsync(
        SECURE_STORE_USER_INFO_KEY,
      );

      let userInfo = null;
      if (userInfoStr) {
        userInfo = JSON.parse(userInfoStr);
      }

      set({ 
        accessToken: accessToken || null, 
        refreshToken: refreshToken || null, 
        userInfo, 
        isLoading: false 
      });
    } catch (error) {
      console.error("Error loading auth from SecureStore:", error);
      set({ isLoading: false });
    }
  },
}));
