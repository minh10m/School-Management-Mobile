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
      setCourses(data.items);
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
        <View className="w-10" />
      </View>

      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.9}
            onPress={() => {
              router.push(`/student/courses/${item.id}` as any);
            }}
            className="bg-white rounded-[32px] border border-gray-100 shadow-2xl shadow-indigo-100/50 mb-6 p-6 overflow-hidden"
          >
            {/* Background Decorative Circle */}
            <View className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50/50 rounded-full" />
            
            <View className="flex-row items-center gap-4 mb-5">
              <View className="w-14 h-14 bg-indigo-600 rounded-2xl items-center justify-center shadow-lg shadow-indigo-200">
                <Ionicons name="journal" size={26} color="white" />
              </View>
              <View className="flex-1">
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#1E293B] text-lg leading-tight" numberOfLines={2}>
                  {item.courseName}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="bg-emerald-100 px-2.5 py-0.5 rounded-lg mr-2">
                    <Text style={{ fontFamily: "Poppins-Bold" }} className="text-emerald-600 text-[9px] uppercase">
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
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-full bg-emerald-500" />
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-emerald-600 text-xs uppercase tracking-widest">
                  Đang diễn ra
                </Text>
              </View>
              
              <View className="bg-indigo-600 h-12 px-6 rounded-2xl flex-row items-center justify-center shadow-lg shadow-indigo-200">
                 <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white text-xs mr-2">
                    VÀO HỌC
                 </Text>
                 <Ionicons name="play-circle" size={18} color="white" />
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
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-400 mt-4 text-center"
              >
                Bạn chưa đăng ký khóa học nào.{"\n"}Hãy tham gia ngay nhé!
              </Text>
              <TouchableOpacity
                onPress={() => router.replace("/student/courses" as any)}
                className="mt-6 bg-indigo-600 px-8 py-3 rounded-2xl"
              >
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-white"
                >
                  Xem danh sách khóa học
                </Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
