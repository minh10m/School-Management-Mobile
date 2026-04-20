import { Stack, router } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useEffect } from "react";

export default function TeacherLayout() {
  const userInfo = useAuthStore((state) => (state as any).userInfo);
  const isLoading = useAuthStore((state) => (state as any).isLoading);

  useEffect(() => {
    if (!isLoading && !userInfo) {
      router.replace("/login");
    }
  }, [userInfo, isLoading]);

  if (isLoading || !userInfo) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
        <ActivityIndicator size="large" color="#136ADA" />
      </View>
    );
  }

  if (userInfo.role?.toLowerCase() !== "teacher") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
        <ActivityIndicator size="large" color="#FF3B30" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="students/index" />
      <Stack.Screen name="students/[id]" />
      <Stack.Screen name="community/teachers/index" />
      <Stack.Screen name="community/teachers/[id]" />
      <Stack.Screen name="my-class/index" />
      <Stack.Screen name="my-class/[id]" />
      <Stack.Screen name="my-homeroom-class/index" />

      <Stack.Screen name="schedules/index" />
      <Stack.Screen name="assignments/index" />
      <Stack.Screen name="results/index" />
      <Stack.Screen name="homeroom-results" />
      <Stack.Screen name="batch-entry" />
      <Stack.Screen name="manage-result" />
      <Stack.Screen name="courses/index" />
      <Stack.Screen name="lessons/index" />
    </Stack>
  );
}
