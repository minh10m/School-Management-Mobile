import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Href, Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View } from "react-native";
import { authService } from "../services/auth.service";

export default function SignupScreen() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !name) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        email,
        password,
      };
      console.log("Signup Payload:", payload);

      await authService.signup(payload);

      alert("Account created successfully!");
      router.replace("/home" as Href);
    } catch (error: any) {
      console.error(error);
      alert(
        "Signup failed: " + (error.response?.data?.message || error.message),
      );
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
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          className="px-6"
        >
          {/* Header Text */}
          <View className="mb-10 mt-10">
            <Text className="text-bright-blue text-3xl mb-2" style={{ fontFamily: 'Poppins-Bold' }}>
              Sign up
            </Text>
            <Text className="text-gray-500 text-base" style={{ fontFamily: 'Poppins-Regular' }}>
              Create an account to get started
            </Text>
          </View>

          {/* Inputs */}
          <View className="space-y-4 w-full mb-8">
            <View>
              <Text className="text-black text-sm mb-2 ml-1" style={{ fontFamily: 'Poppins-Medium' }}>
                Name
              </Text>
              <TextInput
                placeholder="John Doe"
                placeholderTextColor="#9CA3AF"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base" style={{ fontFamily: 'Poppins-Regular' }}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View>
              <Text className="text-black text-sm mb-2 ml-1" style={{ fontFamily: 'Poppins-Medium' }}>
                Email Address
              </Text>
              <TextInput
                placeholder="name@email.com"
                placeholderTextColor="#9CA3AF"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base" style={{ fontFamily: 'Poppins-Regular' }}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View>
              <Text className="text-black text-sm mb-2 ml-1" style={{ fontFamily: 'Poppins-Medium' }}>
                Password
              </Text>
              <View className="relative justify-center">
                <TextInput
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!passwordVisible}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base pr-12" style={{ fontFamily: 'Poppins-Regular' }}
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
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            className={`bg-bright-blue w-full py-4 rounded-xl items-center active:opacity-90 mb-6 ${loading ? "opacity-70" : ""}`}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text className="text-white text-lg" style={{ fontFamily: 'Poppins-SemiBold' }}>
              {loading ? "Creating Account..." : "Sign up"}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center mb-10">
            <Text className="text-gray-500 text-base" style={{ fontFamily: 'Poppins-Regular' }}>
              Already have an account?{" "}
            </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text className="text-bright-blue text-base" style={{ fontFamily: 'Poppins-SemiBold' }}>
                  Log in
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
