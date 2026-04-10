import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Href, Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/authStore";

export default function LoginScreen() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { accessToken, userInfo } = useAuthStore();

  useEffect(() => {
    // If we have an access token and user info, we can redirect immediately
    if (accessToken && userInfo) {
      redirectUser(userInfo.role);
    }
  }, [accessToken, userInfo]);

  const redirectUser = (role?: string) => {
    const r = role?.toLowerCase();
    if (r === "admin") {
      router.replace("/admin" as Href);
    } else if (r === "teacher") {
      router.replace("/teacher" as Href);
    } else {
      router.replace("/home" as Href);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter both username and password");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userName: username,
        passWord: password,
      };

      console.log("Login Payload:", payload);

      await authService.login(payload);
      const updatedUserInfo = useAuthStore.getState().userInfo;
      redirectUser(updatedUserInfo?.role);
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar hidden />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 px-6 justify-center">
              {/* Illustration */}
              <View className="items-center mb-5 mt-10">
                <Image
                  source={require("../assets/images/login.png")}
                  style={{ width: 250, height: 250 }}
                  contentFit="contain"
                />
              </View>

              {/* Welcome Text */}
              <Text
                className="text-bright-blue text-lg text-center mb-8"
                style={{ fontFamily: "Poppins-Regular" }}
              >
                Hello, Login to continue using our app
              </Text>

              {/* Inputs */}
              <View className="space-y-4 w-full">
                <View>
                  <TextInput
                    placeholder="Username"
                    placeholderTextColor="#9CA3AF"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
                    style={{ fontFamily: "Poppins-Regular" }}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>

                <View className="relative justify-center mt-4">
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!passwordVisible}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base pr-12"
                    style={{ fontFamily: "Poppins-Regular" }}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    className="absolute right-4"
                    onPress={() => setPasswordVisible(!passwordVisible)}
                  >
                    <Ionicons
                      name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                      size={24}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forget Password */}
              <View className="w-full items-end mt-2 mb-8">
                <TouchableOpacity>
                  <Text
                    className="text-bright-blue text-sm"
                    style={{ fontFamily: "Poppins-Regular" }}
                  >
                    Forget password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Log In Button */}
              <TouchableOpacity
                className={`bg-bright-blue w-full py-4 rounded-xl items-center active:opacity-90 mb-10 ${
                  loading ? "opacity-70" : ""
                }`}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text
                  className="text-white text-lg"
                  style={{ fontFamily: "Poppins-SemiBold" }}
                >
                  {loading ? "Logging in..." : "Log in"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
