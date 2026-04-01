import { Stack } from 'expo-router';

export default function TeacherLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="classes/index" />
      <Stack.Screen name="attendance/index" />
      <Stack.Screen name="schedules/index" />
      <Stack.Screen name="assignments/index" />
      <Stack.Screen name="submissions/index" />
      <Stack.Screen name="results/index" />
      <Stack.Screen name="courses/index" />
      <Stack.Screen name="lessons/index" />
    </Stack>
  );
}
