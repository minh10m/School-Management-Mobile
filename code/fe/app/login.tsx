import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Href, Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/authStore";

export default function LoginScreen() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

      const userInfo = useAuthStore.getState().userInfo;
      console.log("Logged in user:", userInfo);
      // alert("Login Success!");

      if (userInfo?.role?.toLowerCase() === 'admin') {
        router.replace("/admin" as Href);
      } else if (userInfo?.role?.toLowerCase() === 'teacher') {
        router.replace("/teacher" as Href);
      } else {
        router.replace("/home" as Href);
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || error.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar hidden />
      <View className="flex-1 px-6 justify-center">
        {/* Illustration */}
        <View className="items-center mb-5">
          <Image
            source={require("../assets/images/login.png")}
            style={{ width: 300, height: 300 }}
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

          <View className="relative justify-center">
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
          className={`bg-bright-blue w-full py-4 rounded-xl items-center active:opacity-90 mb-4 ${loading ? "opacity-70" : ""}`}
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

        {/* Sign Up Link */}
        <View className="flex-row justify-center mt-4">
          <Text
            className="text-gray-500 text-base"
            style={{ fontFamily: "Poppins-Regular" }}
          >
            Don’t have an account ?{" "}
          </Text>
          <Link href="/signup" asChild>
            <TouchableOpacity>
              <Text
                className="text-bright-blue text-base"
                style={{ fontFamily: "Poppins-SemiBold" }}
              >
                Sign up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
