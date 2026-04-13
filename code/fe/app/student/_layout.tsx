import { Stack } from 'expo-router';

export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="courses/index" />
      <Stack.Screen name="courses/[id]" />
      <Stack.Screen name="courses/registered" />
      <Stack.Screen name="exam-schedule" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="results" />
      <Stack.Screen name="assignments/index" />
      <Stack.Screen name="assignments/[id]" />
      <Stack.Screen name="payment/index" />
      <Stack.Screen name="payment/payment-detail" />
      <Stack.Screen name="payment/success" />
      <Stack.Screen name="attendance" />
      <Stack.Screen name="timetable" />
      <Stack.Screen name="events" />
    </Stack>
  );
}
