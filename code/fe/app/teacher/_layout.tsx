import { Stack, router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useEffect } from 'react';

export default function TeacherLayout() {
  const { userInfo } = useAuthStore();

  useEffect(() => {
    if (!userInfo) {
       router.replace('/login');
       return;
    }
    if (userInfo.role?.toLowerCase() !== 'teacher') {
       if (userInfo.role?.toLowerCase() === 'admin') {
          router.replace('/admin');
       } else {
          router.replace('/home');
       }
    }
  }, [userInfo]);

  if (!userInfo || userInfo.role?.toLowerCase() !== 'teacher') return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="students/index" />
      <Stack.Screen name="students/[id]" />
      <Stack.Screen name="community/teachers/index" />
      <Stack.Screen name="community/teachers/[id]" />
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
