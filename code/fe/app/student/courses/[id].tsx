import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useCallback } from "react";
import { courseService } from "../../../services/course.service";
import { CourseResponse } from "../../../types/course";

export default function StudentCourseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCourseDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await courseService.getCourseById(id);
      setCourse(data);
    } catch (error) {
      console.error("Error fetching course detail:", error);
      Alert.alert("Lỗi", "Không thể tải chi tiết khóa học.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourseDetail();
  }, [fetchCourseDetail]);

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
          Chi tiết khóa học
        </Text>
        <TouchableOpacity onPress={() => router.push("/student/courses/registered" as any)}>
          <Ionicons name="bookmark-outline" size={24} color="#136ADA" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : course ? (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Hero Section */}
          <View className="bg-blue-600 px-6 py-10 rounded-b-[40px] shadow-sm mb-6">
            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white text-2xl mb-2">
              {course.courseName}
            </Text>
            <View className="flex-row items-center gap-2">
              <View className="bg-blue-500/50 px-3 py-1 rounded-full">
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-white text-xs uppercase">
                  {course.subjectName}
                </Text>
              </View>
              <View className="bg-white/20 px-3 py-1 rounded-full">
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-white text-xs">
                  {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString()}đ`}
                </Text>
              </View>
            </View>
          </View>

          {/* Teacher Info */}
          <View className="px-6 mb-6">
            <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex-row items-center">
              <View className="w-12 h-12 bg-orange-100 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="person" size={24} color="#F97316" />
              </View>
              <View>
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-black text-sm">
                  Giảng viên: {course.teacherName}
                </Text>
                <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-400 text-xs lowercase">
                  @{course.teacherName.replace(/\s/g, '').toLowerCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View className="px-6 mb-8">
            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-lg mb-3 ml-1">
              Mô tả khóa học
            </Text>
            <View className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-600 leading-relaxed">
                {course.description || "Không có mô tả cho khóa học này."}
              </Text>
            </View>
          </View>

          {/* Info Cards */}
          <View className="px-6 flex-row justify-between mb-8">
            <View className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm w-[48%] items-center">
              <Ionicons name="calendar-outline" size={24} color="#136ADA" className="mb-2" />
              <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-800 text-xs text-center">Ngày tạo</Text>
              <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-400 text-[10px]">{new Date(course.createdAt).toLocaleDateString('vi-VN')}</Text>
            </View>
            <View className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm w-[48%] items-center">
              <Ionicons name="ribbon-outline" size={24} color="#10B981" className="mb-2" />
              <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-800 text-xs text-center">Trạng thái</Text>
              <Text style={{ fontFamily: "Poppins-Regular" }} className="text-green-500 text-[10px] uppercase font-bold">Đã duyệt</Text>
            </View>
          </View>

          {/* Enrollment Notice */}
          <View className="px-6">
            <View className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex-row items-center">
              <Ionicons name="alert-circle" size={20} color="#F97316" className="mr-3" />
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-orange-700 text-[11px] flex-1">
                Chức năng đăng ký khóa học hiện đang được xây dựng. Vui lòng quay lại sau!
              </Text>
            </View>
          </View>

        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500">Không tìm thấy khóa học.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
