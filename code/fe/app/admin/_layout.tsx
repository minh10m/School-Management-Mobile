import { Stack, useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { useEffect } from "react";

export default function AdminLayout() {
  const { userInfo } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!userInfo) {
      router.replace("/login");
      return;
    }
    if (userInfo.role?.toLowerCase() !== "admin") {
      // If not admin, send back to home/teacher
      if (userInfo.role?.toLowerCase() === "teacher") {
        router.replace("/teacher");
      } else {
        router.replace("/home");
      }
    }
  }, [userInfo]);

  if (!userInfo || userInfo.role?.toLowerCase() !== "admin") return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="users/index" />
      <Stack.Screen name="users/create" />
      <Stack.Screen name="users/[id]" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="students/index" />
      <Stack.Screen name="students/[id]" />
      <Stack.Screen name="teachers/index" />
      <Stack.Screen name="teachers/[id]" />
      <Stack.Screen name="class-years/index" />
      <Stack.Screen name="class-years/create" />
      <Stack.Screen name="class-years/[id]" />
      <Stack.Screen name="class-years/promote" />
      <Stack.Screen name="roles/index" />
      <Stack.Screen name="subjects/index" />
      <Stack.Screen name="subjects/create" />
      <Stack.Screen name="subjects/[id]" />
      <Stack.Screen name="schedules/index" />
      <Stack.Screen name="schedules/create" />
      <Stack.Screen name="schedules/[id]" />
      <Stack.Screen name="exam-schedules/index" />
      <Stack.Screen name="exam-schedules/create" />
      <Stack.Screen name="exam-schedules/[id]" />
      <Stack.Screen name="fees/index" />
      <Stack.Screen name="fees/[id]" />
      <Stack.Screen name="courses/index" />
      <Stack.Screen name="courses/lessons" />
      <Stack.Screen name="events/index" />
      <Stack.Screen name="events/create" />
      <Stack.Screen name="payments/index" />
    </Stack>
  );
}
