import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { lessonService, lessonVideoService, lessonAssignmentService } from "../../../services/lesson.service";
import { LessonResponse, LessonVideoResponse, LessonAssignmentResponse } from "../../../types/lesson";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";

export default function AdminLessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [videos, setVideos] = useState<LessonVideoResponse[]>([]);
  const [assignments, setAssignments] = useState<LessonAssignmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLessonDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [lessonData, videosResponse, assignmentsData] = await Promise.all([
        lessonService.getLessonById(id),
        lessonVideoService.getLessonVideos({ lessonId: id, pageNumber: 1, pageSize: 100 }).catch(() => ({ items: [], totalCount: 0 })),
        lessonAssignmentService.getLessonAssignments({ lessonId: id, pageNumber: 1, pageSize: 100 }).catch(() => ({ items: [], totalCount: 0 })),
      ]);
      setLesson(lessonData);
      setVideos(videosResponse?.items || []);
      setAssignments(assignmentsData?.items || []);
    } catch (error) {
      console.error("Error fetching lesson details:", error);
      Alert.alert("Lỗi", "Không thể tải chi tiết bài giảng.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLessonDetails();
  }, [fetchLessonDetails]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLessonDetails();
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#136ADA" />
      </View>
    );
  }

  if (!lesson) return null;

  return (
    <AdminPageWrapper title="Chi tiết bài giảng">
      <StatusBar style="dark" />
      
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#136ADA" />}
      >
        {/* Lesson Summary Card */}
        <View className="px-6 pt-6">
          <View className="bg-indigo-50/50 p-6 rounded-[40px] border border-indigo-100/50">
            <View className="flex-row items-center gap-2 mb-4">
               <View className="bg-indigo-100 flex-row items-center px-3 py-1 rounded-full border border-indigo-200">
                  <Ionicons name="book" size={12} color="#4F46E5" />
                  <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#4F46E5] text-[10px] ml-1 uppercase">
                    BÀI HỌC {lesson.orderIndex}
                  </Text>
               </View>
            </View>

            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-2xl text-black mb-4">
              {lesson.lessonName}
            </Text>

            <View className="mt-2 pt-6 border-t border-indigo-100/50 flex-row justify-between items-center">
               <View>
                  <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px]">VIDEO</Text>
                  <Text style={{ fontFamily: "Poppins-Bold" }} className="text-indigo-600 text-xl">
                    {videos.length}
                  </Text>
               </View>
               <View className="items-end">
                  <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px]">BÀI TẬP</Text>
                  <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-700 text-xl">
                    {assignments.length}
                  </Text>
               </View>
            </View>
          </View>
        </View>

        {/* Videos Section */}
        <View className="px-6 mt-8">
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-lg text-black mb-4">Video bài giảng</Text>
          {videos.length === 0 ? (
            <View className="bg-gray-50 py-8 rounded-3xl items-center border border-dashed border-gray-300">
              <Ionicons name="videocam-outline" size={32} color="#D1D5DB" />
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-2">Chưa có video nào.</Text>
            </View>
          ) : (
            <View className="gap-3">
              {videos.map((video) => (
                <TouchableOpacity 
                   key={video.id} 
                   onPress={() => router.push(`/admin/lesson-videos/${video.id}` as any)}
                   activeOpacity={0.7}
                   className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex-row items-center gap-4"
                >
                   <View className="w-10 h-10 rounded-xl bg-rose-50 items-center justify-center">
                      <Ionicons name="play" size={20} color="#F43F5E" />
                   </View>
                   <View className="flex-1">
                      <Text style={{ fontFamily: "Poppins-Bold" }} className="text-black text-sm" numberOfLines={1}>
                        {video.name}
                      </Text>
                      <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px]">
                        {(video.duration / 60).toFixed(1)} PHÚT
                      </Text>
                   </View>
                   <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Assignments Section */}
        <View className="px-6 mt-8">
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-lg text-black mb-4">Bài tập đính kèm</Text>
          {assignments.length === 0 ? (
            <View className="bg-gray-50 py-8 rounded-3xl items-center border border-dashed border-gray-300">
              <Ionicons name="document-text-outline" size={32} color="#D1D5DB" />
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-2">Chưa có bài tập nào.</Text>
            </View>
          ) : (
            <View className="gap-3">
              {assignments.map((assignment) => (
                <TouchableOpacity 
                   key={assignment.id} 
                   onPress={() => router.push(`/admin/lesson-assignments/${assignment.id}` as any)}
                   activeOpacity={0.7}
                   className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex-row items-center gap-4"
                >
                   <View className="w-10 h-10 rounded-xl bg-emerald-50 items-center justify-center">
                      <Ionicons name="clipboard" size={20} color="#10B981" />
                   </View>
                   <View className="flex-1">
                      <Text style={{ fontFamily: "Poppins-Bold" }} className="text-black text-sm" numberOfLines={1}>
                        {assignment.title}
                      </Text>
                      <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px]" numberOfLines={1}>
                        {assignment.fileTitle || "TÀI LIỆU BÀI TẬP"}
                      </Text>
                   </View>
                   <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

      </ScrollView>
    </AdminPageWrapper>
  );
}

