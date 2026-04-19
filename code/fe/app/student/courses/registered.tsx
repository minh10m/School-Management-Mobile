import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useCallback } from "react";
import { courseService } from "../../../services/course.service";
import { CourseResponse } from "../../../types/course";

export default function StudentRegisteredCourses() {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRegisteredCourses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await courseService.getRegisteredCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching registered courses:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRegisteredCourses();
  }, [fetchRegisteredCourses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRegisteredCourses();
  }, [fetchRegisteredCourses]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar hidden />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-black text-lg">
          Khóa học của tôi
        </Text>
        <TouchableOpacity onPress={() => router.replace("/student/courses" as any)}>
          <Ionicons name="add-circle-outline" size={26} color="#136ADA" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-4"
            onPress={() => {
               // In the future, this could go to lessons/videos for this course
               router.push(`/student/courses/${item.id}` as any);
            }}
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center">
                  <Ionicons name="journal" size={24} color="#4F46E5" />
                </View>
                <View className="flex-1">
                  <Text style={{ fontFamily: "Poppins-Bold" }} className="text-black text-base" numberOfLines={1}>
                    {item.courseName}
                  </Text>
                  <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px] uppercase">
                    {item.subjectName} • GV: {item.teacherName}
                  </Text>
                </View>
              </View>
              <View className="bg-green-100 px-2.5 py-1 rounded-full">
                <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-green-600 text-[9px] uppercase">
                  Đã đăng ký
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-gray-50">
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-[11px]">
                  Bắt đầu: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                 <Text style={{ fontFamily: "Poppins-Bold" }} className="text-indigo-600 text-xs text-right">
                    Vào học
                 </Text>
                 <Ionicons name="chevron-forward" size={14} color="#4F46E5" />
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          loading && !refreshing ? (
            <View className="items-center py-20">
              <ActivityIndicator size="large" color="#136ADA" />
            </View>
          ) : (
            <View className="items-center py-20">
              <Ionicons name="journal-outline" size={64} color="#D1D5DB" />
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-4 text-center">
                Bạn chưa đăng ký khóa học nào.{"\n"}Hãy tham gia ngay nhé!
              </Text>
              <TouchableOpacity
                onPress={() => router.replace("/student/courses" as any)}
                className="mt-6 bg-indigo-600 px-8 py-3 rounded-2xl"
              >
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white">Xem danh sách khóa học</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
