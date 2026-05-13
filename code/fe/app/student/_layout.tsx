import { Stack } from 'expo-router';

export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="courses/index" options={{ title: "Khám phá khóa học" }} />
      <Stack.Screen name="courses/[id]" options={{ title: "Chi tiết khóa học" }} />
      <Stack.Screen name="courses/lessons" options={{ title: "Nội dung bài giảng" }} />
      <Stack.Screen name="courses/registered" options={{ title: "Khóa học đã đăng ký" }} />
      <Stack.Screen name="exam-schedule" options={{ title: "Lịch thi của tôi" }} />
      <Stack.Screen name="notifications" options={{ title: "Thông báo" }} />
      <Stack.Screen name="results" options={{ title: "Kết quả học tập" }} />
      <Stack.Screen name="assignments/index" options={{ title: "Bài tập về nhà" }} />
      <Stack.Screen name="assignments/[id]" options={{ title: "Chi tiết bài tập" }} />
      <Stack.Screen name="payment/index" options={{ title: "Quản lý học phí" }} />
      <Stack.Screen name="payment/payment-detail" options={{ title: "Chi tiết thanh toán" }} />
      <Stack.Screen name="payment/success" options={{ title: "Thanh toán thành công" }} />
      <Stack.Screen name="attendance" options={{ title: "Lịch sử điểm danh" }} />
      <Stack.Screen name="timetable" options={{ title: "Thời khóa biểu" }} />
      <Stack.Screen name="ai-chat" options={{ title: "Trợ lý học tập AI" }} />
    </Stack>
  );
}
