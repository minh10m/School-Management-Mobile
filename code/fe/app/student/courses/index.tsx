import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useCallback } from "react";
import { courseService } from "../../../services/course.service";
import { CourseResponse } from "../../../types/course";

export default function StudentBrowseCourses() {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllCourseApproved({
        pageNumber: 1,
        pageSize: 100,
        courseName: searchQuery || undefined,
      });
      setCourses(response.items);
    } catch (error) {
      console.error("Error fetching approved courses:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCourses();
  }, [fetchCourses]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar hidden />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-black text-lg">
            Khám phá khóa học
          </Text>
          <TouchableOpacity onPress={() => router.push("/student/courses/registered" as any)}>
            <Ionicons name="bookmark-outline" size={24} color="#136ADA" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Tìm kiếm khóa học..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-black text-sm"
            style={{ fontFamily: "Poppins-Regular" }}
          />
        </View>
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
               router.push(`/student/courses/${item.id}` as any);
            }}
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center">
                  <Ionicons name="library" size={24} color="#3B82F6" />
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
            </View>

            <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-gray-50">
              <View className="flex-row items-center gap-1.5">
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-blue-600 text-base">
                  {item.price === 0 ? "Miễn phí" : `${item.price.toLocaleString()}đ`}
                </Text>
              </View>
              <View className="flex-row items-center gap-1 bg-blue-600 px-4 py-2 rounded-xl">
                 <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white text-xs">
                    Chi tiết
                 </Text>
                 <Ionicons name="chevron-forward" size={14} color="white" />
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
              <Ionicons name="search-outline" size={64} color="#D1D5DB" />
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-4 text-center">
                {searchQuery ? "Không tìm thấy khóa học nào phù hợp." : "Hiện chưa có khóa học nào được đăng tải."}
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
