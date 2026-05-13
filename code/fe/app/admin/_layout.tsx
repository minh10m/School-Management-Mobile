import { Stack, Redirect } from "expo-router";
import { useAuthStore } from "../../store/authStore";

export default function AdminLayout() {
  const { userInfo } = useAuthStore();

  if (!userInfo) {
    return <Redirect href="/login" />;
  }

  if (userInfo.role?.toLowerCase() !== "admin") {
    if (userInfo.role?.toLowerCase() === "teacher") {
      return <Redirect href="/teacher" />;
    }
    return <Redirect href="/home" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Bảng điều khiển Admin" }} />
      <Stack.Screen name="users/index" options={{ title: "Quản lý người dùng" }} />
      <Stack.Screen name="users/create" options={{ title: "Tạo người dùng mới" }} />
      <Stack.Screen name="users/[id]" options={{ title: "Chi tiết người dùng" }} />
      <Stack.Screen name="profile" options={{ title: "Hồ sơ cá nhân" }} />
      <Stack.Screen name="students/index" options={{ title: "Danh sách học sinh" }} />
      <Stack.Screen name="students/[id]" options={{ title: "Chi tiết học sinh" }} />
      <Stack.Screen name="teachers/index" options={{ title: "Danh sách giáo viên" }} />
      <Stack.Screen name="teachers/[id]" options={{ title: "Chi tiết giáo viên" }} />
      <Stack.Screen name="class-years/index" options={{ title: "Quản lý lớp học" }} />
      <Stack.Screen name="class-years/create" options={{ title: "Mở lớp học mới" }} />
      <Stack.Screen name="class-years/[id]" options={{ title: "Chi tiết lớp học" }} />
      <Stack.Screen name="class-years/promote" options={{ title: "Lên lớp học sinh" }} />
      <Stack.Screen name="roles/index" options={{ title: "Quản lý vai trò" }} />
      <Stack.Screen name="subjects/index" options={{ title: "Quản lý môn học" }} />
      <Stack.Screen name="subjects/create" options={{ title: "Tạo môn học mới" }} />
      <Stack.Screen name="subjects/[id]" options={{ title: "Chi tiết môn học" }} />
      <Stack.Screen name="schedules/index" options={{ title: "Quản lý thời khóa biểu" }} />
      <Stack.Screen name="schedules/create" options={{ title: "Tạo thời khóa biểu" }} />
      <Stack.Screen name="schedules/[id]" options={{ title: "Chi tiết thời khóa biểu" }} />
      <Stack.Screen name="exam-schedules/index" options={{ title: "Quản lý lịch thi" }} />
      <Stack.Screen name="exam-schedules/create" options={{ title: "Tạo lịch thi" }} />
      <Stack.Screen name="exam-schedules/[id]" options={{ title: "Chi tiết lịch thi" }} />
      <Stack.Screen name="fees/index" options={{ title: "Quản lý học phí" }} />
      <Stack.Screen name="fees/[id]" options={{ title: "Chi tiết học phí" }} />
      <Stack.Screen name="courses/index" options={{ title: "Quản lý khóa học" }} />
      <Stack.Screen name="courses/lessons" options={{ title: "Bài giảng khóa học" }} />
      <Stack.Screen name="events/index" options={{ title: "Quản lý sự kiện" }} />
      <Stack.Screen name="events/create" options={{ title: "Tạo sự kiện mới" }} />
      <Stack.Screen name="payments/index" options={{ title: "Lịch sử thanh toán" }} />
      <Stack.Screen name="ai-chat" options={{ title: "Trò chuyện AI" }} />
    </Stack>
  );
}
