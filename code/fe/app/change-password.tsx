import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
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

export default function ChangePasswordScreen() {
  const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmedPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmedPassword) {
      alert("New password and confirmed password do not match");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        oldPassword,
        newPassword,
        confirmedPassword,
      };

      console.log("Change Password Payload:", payload);

      await authService.changePassword(payload);

      alert("Password changed successfully!");
      router.back();
    } catch (error: any) {
      console.error(error);
      alert(
        "Change password failed: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar hidden />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 relative border-b border-gray-100">
        <TouchableOpacity
          className="absolute left-6 z-10 p-2"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-black text-lg" style={{ fontFamily: 'Poppins-Bold' }}>
            Change Password
          </Text>
        </View>
        <View className="w-10" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
          <View className="space-y-4 w-full mb-8 mt-4">
            {/* Old Password */}
            <View>
              <Text className="text-black text-sm mb-2 ml-1" style={{ fontFamily: 'Poppins-Medium' }}>
                Old Password
              </Text>
              <View className="relative justify-center">
                <TextInput
                  placeholder="Enter old password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!oldPasswordVisible}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base pr-12" style={{ fontFamily: 'Poppins-Regular' }}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                />
                <TouchableOpacity
                  className="absolute right-4"
                  onPress={() => setOldPasswordVisible(!oldPasswordVisible)}
                >
                  <Ionicons
                    name={
                      oldPasswordVisible ? "eye-off-outline" : "eye-outline"
                    }
                    size={24}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View>
              <Text className="text-black text-sm mb-2 ml-1 mt-4" style={{ fontFamily: 'Poppins-Medium' }}>
                New Password
              </Text>
              <View className="relative justify-center">
                <TextInput
                  placeholder="Enter new password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!newPasswordVisible}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base pr-12" style={{ fontFamily: 'Poppins-Regular' }}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity
                  className="absolute right-4"
                  onPress={() => setNewPasswordVisible(!newPasswordVisible)}
                >
                  <Ionicons
                    name={
                      newPasswordVisible ? "eye-off-outline" : "eye-outline"
                    }
                    size={24}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View>
              <Text className="text-black text-sm mb-2 ml-1 mt-4" style={{ fontFamily: 'Poppins-Medium' }}>
                Confirm Password
              </Text>
              <View className="relative justify-center">
                <TextInput
                  placeholder="Confirm new password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!confirmPasswordVisible}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base pr-12" style={{ fontFamily: 'Poppins-Regular' }}
                  value={confirmedPassword}
                  onChangeText={setConfirmedPassword}
                />
                <TouchableOpacity
                  className="absolute right-4"
                  onPress={() =>
                    setConfirmPasswordVisible(!confirmPasswordVisible)
                  }
                >
                  <Ionicons
                    name={
                      confirmPasswordVisible ? "eye-off-outline" : "eye-outline"
                    }
                    size={24}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Change Password Button */}
          <TouchableOpacity
            className={`bg-bright-blue w-full py-4 rounded-xl items-center active:opacity-90 mb-6 mt-4 ${loading ? "opacity-70" : ""}`}
            onPress={handleChangePassword}
            disabled={loading}
          >
            <Text className="text-white text-lg" style={{ fontFamily: 'Poppins-SemiBold' }}>
              {loading ? "Changing..." : "Change Password"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
