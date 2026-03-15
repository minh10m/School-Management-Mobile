import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="users/index" />
      <Stack.Screen name="users/create" />
      <Stack.Screen name="users/[id]" />
      <Stack.Screen name="class-years/index" />
      <Stack.Screen name="class-years/create" />
      <Stack.Screen name="class-years/[id]" />
      <Stack.Screen name="schedules/index" />
      <Stack.Screen name="schedules/[id]" />
      <Stack.Screen name="exam-schedules/index" />
      <Stack.Screen name="exam-schedules/[id]" />
      <Stack.Screen name="fees/index" />
      <Stack.Screen name="fees/[id]" />
      <Stack.Screen name="courses/index" />
      <Stack.Screen name="events/index" />
      <Stack.Screen name="events/create" />
      <Stack.Screen name="payments/index" />
      <Stack.Screen name="teachers/index" />
      <Stack.Screen name="teachers/[id]" />
    </Stack>
  );
}
