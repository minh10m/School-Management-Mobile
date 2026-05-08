import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, Auth } from "firebase/auth";
// @ts-ignore - Firebase types don't export getReactNativePersistence for web, but Metro bundler resolves it correctly for React Native
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || Constants.expoConfig?.extra?.firebaseApiKey || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || Constants.expoConfig?.extra?.firebaseAuthDomain || "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || Constants.expoConfig?.extra?.firebaseProjectId || "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || Constants.expoConfig?.extra?.firebaseStorageBucket || "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || Constants.expoConfig?.extra?.firebaseMessagingSenderId || "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || Constants.expoConfig?.extra?.firebaseAppId || "",
};
console.log("Firebase Project ID:", firebaseConfig.projectId);
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("MOCK")) {
  console.warn("WARNING: Firebase API Key is missing or using MOCK value. Check your .env file!");
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app); // fallback in case already initialized
}

const db = getFirestore(app);

export { app, auth, db };
