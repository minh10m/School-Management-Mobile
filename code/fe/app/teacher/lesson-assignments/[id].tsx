import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { lessonAssignmentService } from "../../../services/lesson.service";
import { LessonAssignmentResponse } from "../../../types/lesson";

export default function TeacherLessonAssignmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [assignment, setAssignment] = useState<LessonAssignmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAssignmentDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await lessonAssignmentService.getLessonAssignmentById(id);
      setAssignment(data);
    } catch (error) {
      console.log("Error fetching assignment detail:", error);
      Alert.alert("Lỗi", "Không thể tải chi tiết bài tập.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAssignmentDetail();
  }, [fetchAssignmentDetail]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssignmentDetail();
  };

  const openFileLink = () => {
    if (assignment?.fileUrl && assignment.fileUrl !== "Không có dữ liệu") {
      Linking.openURL(assignment.fileUrl).catch(() => {
         Alert.alert("Lỗi", "Không thể mở liên kết tài liệu này.");
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]">
      <StatusBar hidden />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-[#FAFAFA]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm shadow-gray-100/50 border border-gray-50">
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-[15px]">
          Chi tiết bài tập
        </Text>
        <View className="w-10" />
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : assignment ? (
        <ScrollView 
          className="flex-1 px-5 pt-6" 
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#136ADA" />}
        >
          <View className="bg-white rounded-[32px] p-6 border border-gray-100/80 shadow-sm shadow-gray-100/50 mb-6">
            {/* Header/Title */}
            <View className="mb-6 flex-row items-start">
              <View className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center mr-4 mt-1">
                 <Ionicons name="document-text" size={24} color="#4F46E5" />
              </View>
              <View className="flex-1">
                <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-indigo-600 text-[10px] uppercase tracking-widest mb-1">
                  Bài tập {assignment.orderIndex}
                </Text>
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-2xl text-gray-900 leading-tight">
                  {assignment.title}
                </Text>
              </View>
            </View>

            {/* Description */}
            {!!assignment.description && (
              <View className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100/50 mb-6">
                <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-400 text-[11px] uppercase tracking-widest mb-2">
                  Mô tả
                </Text>
                <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-700 text-[14px] leading-6">
                  {assignment.description}
                </Text>
              </View>
            )}

            {/* Attachment */}
            <View>
              <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-400 text-[11px] uppercase tracking-widest mb-3 ml-1">
                Tài liệu đính kèm
              </Text>
              {(!assignment.fileUrl || assignment.fileUrl === "Không có dữ liệu") ? (
                 <View className="bg-gray-50 py-8 rounded-2xl items-center border border-dashed border-gray-200">
                    <Ionicons name="folder-open-outline" size={28} color="#D1D5DB" className="mb-2" />
                    <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-sm text-center">Chưa có tài liệu đính kèm</Text>
                 </View>
               ) : (
                  <TouchableOpacity 
                    onPress={openFileLink} 
                    activeOpacity={0.6}
                    className="bg-blue-50/50 p-4 rounded-2xl flex-row items-center border border-blue-100/50"
                 >
                    <View className="w-12 h-12 bg-white rounded-xl items-center justify-center mr-4 shadow-sm shadow-blue-100/50">
                       <Ionicons name="cloud-download-outline" size={24} color="#3B82F6" />
                    </View>
                    <View className="flex-1 pr-2">
                       <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-[14px] mb-0.5 leading-tight" numberOfLines={2}>
                          {assignment.fileTitle && assignment.fileTitle !== "Không có dữ liệu" ? assignment.fileTitle : "Tài liệu thực hành"}
                       </Text>
                       <Text style={{ fontFamily: "Poppins-Medium" }} className="text-blue-500/80 text-[11px]">
                          Chạm để xem hoặc tải về
                       </Text>
                    </View>
                 </TouchableOpacity>
               )}
            </View>
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center p-10">
           <Ionicons name="alert-circle-outline" size={64} color="#D1D5DB" />
           <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-4 text-center">Không tìm thấy thông tin bài tập.</Text>
        </View>
      )}

    </SafeAreaView>
  );
}
