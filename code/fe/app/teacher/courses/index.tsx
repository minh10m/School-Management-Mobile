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
import { useFocusEffect } from "expo-router";
import { courseService } from "../../../services/course.service";
import { CourseResponse } from "../../../types/course";

export default function TeacherCourses() {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await courseService.getMyCourses({
        pageNumber: 1,
        pageSize: 100,
      });
      setCourses(response.items);
    } catch (error) {
      console.error("Error fetching teacher courses:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCourses();
    }, [fetchCourses])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCourses();
  }, [fetchCourses]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar hidden />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className="text-black text-lg"
        >
          Khóa học của tôi
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/teacher/courses/create" as any)}
        >
          <Ionicons name="add-circle-outline" size={26} color="#136ADA" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View
            className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm mb-5"
          >
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-row items-center gap-4 flex-1">
                <View className="w-12 h-12 bg-orange-50 rounded-2xl items-center justify-center">
                  <Ionicons name="play-circle" size={26} color="#F97316" />
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: "Poppins-Bold" }}
                    className="text-black text-lg leading-tight"
                    numberOfLines={2}
                  >
                    {item.courseName}
                  </Text>
                  <View className="flex-row items-center mt-2 gap-2">
                    <View className="bg-blue-50 px-2 py-0.5 rounded-lg">
                      <Text
                        style={{ fontFamily: "Poppins-Bold" }}
                        className="text-[#136ADA] text-[9px] uppercase"
                      >
                        {item.subjectName}
                      </Text>
                    </View>
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-orange-600 text-[11px]"
                    >
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.price)}
                    </Text>
                  </View>
                </View>
              </View>
              <View
                className={`px-3 py-1.5 rounded-xl ${
                  item.status?.toLowerCase() === "approved"
                    ? "bg-green-50"
                    : item.status?.toLowerCase() === "rejected"
                      ? "bg-red-50"
                      : "bg-orange-50"
                }`}
              >
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className={`text-[8px] uppercase tracking-wider ${
                    item.status?.toLowerCase() === "approved"
                      ? "text-green-600"
                      : item.status?.toLowerCase() === "rejected"
                        ? "text-red-600"
                        : "text-orange-600"
                  }`}
                >
                  {item.status?.toLowerCase() === "approved"
                    ? "Sẵn sàng"
                    : item.status?.toLowerCase() === "rejected"
                      ? "Bị từ chối"
                      : "Chờ duyệt"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mt-2 pt-5 border-t border-gray-50 gap-3">
              <TouchableOpacity
                onPress={() => {
                  router.push(`/teacher/lessons?courseId=${item.id}` as any);
                }}
                className="flex-1 bg-gray-50 h-14 rounded-2xl flex-row items-center justify-center gap-2 border border-gray-100"
              >
                <Ionicons name="folder-outline" size={16} color="#475569" />
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-gray-600 text-xs"
                >
                  Bài giảng
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  router.push(`/teacher/courses/${item.id}` as any);
                }}
                className="flex-1 bg-indigo-50 h-14 rounded-2xl flex-row items-center justify-center gap-2 border border-indigo-100/50"
              >
                <Ionicons name="create-outline" size={16} color="#4F46E5" />
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-[#4F46E5] text-xs"
                >
                  Chỉnh sửa
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          loading && !refreshing ? (
            <View className="items-center py-20">
              <ActivityIndicator size="large" color="#136ADA" />
            </View>
          ) : (
            <View className="items-center py-20">
              <Ionicons name="play-circle-outline" size={64} color="#D1D5DB" />
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-400 mt-4 text-center"
              >
                Bạn chưa tạo khóa học nào.
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
