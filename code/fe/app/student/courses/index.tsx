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
      
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-black text-lg">
            Khám phá khóa học
          </Text>
          <View className="w-10" />
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
        contentContainerStyle={{ padding: 24, paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.9}
            onPress={() => {
               router.push(`/student/courses/${item.id}` as any);
            }}
            className="bg-white rounded-[32px] border border-gray-100 shadow-2xl shadow-blue-100/50 mb-6 p-6 overflow-hidden"
          >
            {/* Background Decorative Gradient-like circle */}
            <View className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50/50 rounded-full" />
            
            <View className="flex-row items-center gap-4 mb-5">
              <View className="w-14 h-14 bg-blue-600 rounded-2xl items-center justify-center shadow-lg shadow-blue-200">
                <Ionicons name="book" size={26} color="white" />
              </View>
              <View className="flex-1">
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#1E293B] text-lg leading-tight" numberOfLines={2}>
                  {item.courseName}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="bg-orange-100 px-2.5 py-0.5 rounded-lg mr-2">
                    <Text style={{ fontFamily: "Poppins-Bold" }} className="text-orange-600 text-[9px] uppercase">
                       {item.subjectName}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[11px]">
                    GV: {item.teacherName}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row items-center justify-between pt-5 border-t border-gray-50">
              <View>
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px] uppercase mb-0.5">Học phí</Text>
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#1E293B] text-xl">
                  {item.price === 0 ? "Free" : `${item.price.toLocaleString()}đ`}
                </Text>
              </View>
              
              <View className="bg-blue-600 h-12 px-6 rounded-2xl flex-row items-center justify-center shadow-lg shadow-blue-200">
                 <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white text-xs mr-2">
                    CHI TIẾT
                 </Text>
                 <Ionicons name="chevron-forward" size={16} color="white" />
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
