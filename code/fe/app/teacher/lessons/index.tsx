import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useCallback } from "react";
import { lessonService } from "../../../services/lesson.service";
import { LessonResponse } from "../../../types/lesson";

export default function TeacherLessons() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const [lessons, setLessons] = useState<LessonResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchLessons = useCallback(async () => {
    if (!courseId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await lessonService.getLessons({ courseId, pageNumber: 1, pageSize: 100 });
      setLessons(response.items);
    } catch (error) {
      console.log("Error fetching course lessons:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [courseId]);

  useFocusEffect(
    useCallback(() => {
      fetchLessons();
    }, [fetchLessons])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLessons();
  }, [fetchLessons]);

  const handleDeleteLesson = async (lessonId: string) => {
    Alert.alert(
      "Xóa bài học",
      "Bạn có chắc chắn muốn xóa bài học này không? Tất cả tài liệu video và bài tập liên quan cũng sẽ bị xóa.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await lessonService.deleteLesson(lessonId);
              Alert.alert("Thành công", "Đã xóa bài học thành công!");
              fetchLessons();
            } catch (err) {
              console.log(err);
              Alert.alert("Lỗi", "Không thể xóa bài học.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableWithoutFeedback onPress={() => setOpenMenuId(null)}>
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
          Bài giảng khóa học
        </Text>
        <TouchableOpacity
          onPress={() =>
            courseId &&
            router.push(`/teacher/lessons/create?courseId=${courseId}` as any)
          }
          disabled={!courseId}
        >
          <Ionicons
            name="add-circle-outline"
            size={26}
            color={courseId ? "#136ADA" : "#D1D5DB"}
          />
        </TouchableOpacity>
      </View>

      {!courseId ? (
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons
            name="information-circle-outline"
            size={64}
            color="#D1D5DB"
          />
          <Text
            style={{ fontFamily: "Poppins-Medium" }}
            className="text-gray-400 mt-4 text-center"
          >
            Vui lòng chọn khóa học để xem danh sách bài giảng.
          </Text>
        </View>
      ) : (
        <FlatList
          data={lessons}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm mb-4"
            onPress={() => {
              // Navigate to lesson detail
              router.push(`/teacher/lessons/${item.id}` as any);
            }}
          >
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center">
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-indigo-600 text-lg"
                >
                  {index + 1}
                </Text>
              </View>
              <View className="flex-1">
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-black text-base"
                  numberOfLines={1}
                >
                  {item.lessonName}
                </Text>
                <Text
                  style={{ fontFamily: "Poppins-Medium" }}
                  className="text-gray-400 text-[10px] uppercase tracking-wider"
                >
                  Thứ tự hiển thị: {item.orderIndex}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="relative z-50">
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === item.id ? null : item.id);
                    }}
                    className="p-2"
                  >
                    <Ionicons name="ellipsis-vertical" size={18} color="#9CA3AF" />
                  </TouchableOpacity>

                  {openMenuId === item.id && (
                    <View 
                      className="absolute right-8 top-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden" 
                      style={{ elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, minWidth: 80 }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          setOpenMenuId(null);
                          handleDeleteLesson(item.id);
                        }}
                        className="flex-row items-center px-4 py-3"
                      >
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        <Text className="text-red-500 text-xs ml-2" style={{ fontFamily: "Poppins-Medium" }}>
                          Xóa
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                <View className="bg-gray-50 w-8 h-8 rounded-xl items-center justify-center">
                  <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                </View>
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
                <Ionicons
                  name="folder-open-outline"
                  size={64}
                  color="#D1D5DB"
                />
                <Text
                  style={{ fontFamily: "Poppins-Medium" }}
                  className="text-gray-400 mt-4 text-center"
                >
                  Không tìm thấy bài giảng nào cho khóa học này.
                </Text>
              </View>
            )
          }
        />
      )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
