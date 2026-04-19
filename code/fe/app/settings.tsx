import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { useState } from "react";
import { Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View } from "react-native";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/authStore";

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { } = useAuthStore();

  const SettingItem = ({ icon, label, onPress, value, type = "link" }: any) => (
    <TouchableOpacity
      className="flex-row items-center justify-between py-4 border-b border-gray-100"
      onPress={onPress}
      disabled={type === "switch"}
    >
      <View className="flex-row items-center gap-4">
        <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <Ionicons name={icon} size={20} color="#6B7280" />
        </View>
        <Text className="text-black text-base" style={{ fontFamily: 'Poppins-Medium' }}>
          {label}
        </Text>
      </View>

      {type === "switch" ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: "#D1D5DB", true: "#136ADA" }}
          thumbColor={value ? "#ffffff" : "#f4f3f4"}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
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
          <Text className="text-black text-lg" style={{ fontFamily: 'Poppins-Bold' }}>Cài đặt</Text>
        </View>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-gray-500 text-sm mb-2 mt-4" style={{ fontFamily: 'Poppins-Medium' }}>
          Chung
        </Text>
        <View className="bg-white">
          <SettingItem
            icon="notifications-outline"
            label="Thông báo"
            type="switch"
            value={notificationsEnabled}
            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
          />
          <SettingItem
            icon="globe-outline"
            label="Ngôn ngữ"
            onPress={() => {}}
          />
        </View>

        <Text className="text-gray-500 text-sm mb-2 mt-8" style={{ fontFamily: 'Poppins-Medium' }}>
          Bảo mật
        </Text>
        <View className="bg-white">
          <SettingItem
            icon="lock-closed-outline"
            label="Đổi mật khẩu"
            onPress={() => router.push("/change-password" as any)}
          />
        </View>

        <Text className="text-gray-500 text-sm mb-2 mt-8" style={{ fontFamily: 'Poppins-Medium' }}>
          Hỗ trợ
        </Text>
        <View className="bg-white">
          <SettingItem
            icon="help-circle-outline"
            label="Trợ giúp & Hỗ trợ"
            onPress={() => {}}
          />
          <SettingItem
            icon="document-text-outline"
            label="Chính sách bảo mật"
            onPress={() => {}}
          />
          <SettingItem
            icon="information-circle-outline"
            label="Điều khoản dịch vụ"
            onPress={() => {}}
          />
        </View>


      </ScrollView>
    </SafeAreaView>
  );
}
