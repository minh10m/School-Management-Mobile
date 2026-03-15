import { Stack } from 'expo-router';

export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="bus-tracking" />
      <Stack.Screen name="exam-schedule" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="results" />
      <Stack.Screen name="homework/index" />
      <Stack.Screen name="homework/calendar" />
      <Stack.Screen name="homework/homework-detail" />
      <Stack.Screen name="payment/index" />
      <Stack.Screen name="payment/payment-detail" />
      <Stack.Screen name="payment/success" />
    </Stack>
  );
}
