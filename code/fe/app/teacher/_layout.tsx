import {
  Stack,
  router,
  useSegments,
  useRootNavigationState,
} from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useEffect } from "react";

export default function TeacherLayout() {
  const userInfo = useAuthStore((state) => (state as any).userInfo);
  const isLoading = useAuthStore((state) => (state as any).isLoading);
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;
    if (!isLoading && !userInfo) {
      router.replace("/login");
    }
  }, [userInfo, isLoading, navigationState?.key]);

  // Navigation chưa ready hoặc đang load
  if (!navigationState?.key || isLoading || !userInfo) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <ActivityIndicator size="large" color="#136ADA" />
      </View>
    );
  }

  if (userInfo.role?.toLowerCase() !== "teacher") {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <ActivityIndicator size="large" color="#FF3B30" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Bảng điều khiển Giáo viên" }} />
      <Stack.Screen name="edit-profile" options={{ title: "Hồ sơ cá nhân" }} />
      <Stack.Screen name="students/index" options={{ title: "Danh sách học sinh" }} />
      <Stack.Screen name="students/[id]" options={{ title: "Hồ sơ học sinh" }} />
      <Stack.Screen name="community/teachers/index" options={{ title: "Cộng đồng giáo viên" }} />
      <Stack.Screen name="community/teachers/[id]" options={{ title: "Hồ sơ đồng nghiệp" }} />
      <Stack.Screen name="my-class/index" options={{ title: "Lớp học của tôi" }} />
      <Stack.Screen name="my-class/[id]" options={{ title: "Quản lý lớp học" }} />
      <Stack.Screen name="my-homeroom-class/index" options={{ title: "Lớp chủ nhiệm" }} />
      <Stack.Screen name="schedules/index" options={{ title: "Thời khóa biểu dạy" }} />
      <Stack.Screen name="my-class/assignments" options={{ title: "Bài tập giao về" }} />
      <Stack.Screen name="my-class/assignments/[id]" options={{ title: "Chi tiết bài tập" }} />
      <Stack.Screen name="my-class/create-assignment" options={{ title: "Giao bài tập mới" }} />
      <Stack.Screen name="my-homeroom-class/results" options={{ title: "Kết quả học tập lớp CN" }} />
      <Stack.Screen name="my-class/batch-entry" options={{ title: "Nhập điểm hàng loạt" }} />
      <Stack.Screen name="manage-result" options={{ title: "Quản lý điểm số" }} />
      <Stack.Screen name="courses/index" options={{ title: "Khóa học của tôi" }} />
      <Stack.Screen name="courses/create" options={{ title: "Tạo khóa học mới" }} />
      <Stack.Screen name="lessons/index" options={{ title: "Quản lý bài giảng" }} />
      <Stack.Screen name="submissions/index" options={{ title: "Bài nộp của học sinh" }} />
      <Stack.Screen name="submissions/[id]" options={{ title: "Chấm điểm bài nộp" }} />
      <Stack.Screen name="attendance/index" options={{ title: "Điểm danh lớp học" }} />
      <Stack.Screen name="attendance/[classYearId]" options={{ title: "Chi tiết điểm danh" }} />
      <Stack.Screen name="ai-chat" options={{ title: "Trợ lý AI" }} />
    </Stack>
  );
}
