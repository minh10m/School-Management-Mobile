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
      console.error("Error fetching assignment detail:", error);
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
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar hidden />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-black text-lg">
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
          className="flex-1" 
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#136ADA" />}
        >
          {/* Assignment Info Card */}
          <View className="px-6 pt-6">
            <View className="bg-emerald-50/50 p-8 rounded-[40px] border border-emerald-100/50 relative overflow-hidden">
              {/* Decorative Circle */}
              <View className="absolute right-[-20] top-[-20] w-32 h-32 bg-emerald-100/30 rounded-full" />
              
              <View className="flex-row items-center gap-2 mb-6">
                 <View className="bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200">
                    <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#059669] text-[10px] uppercase tracking-widest">
                      Thứ tự: {assignment.orderIndex}
                    </Text>
                 </View>
              </View>

              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-2xl text-black mb-6 leading-tight">
                {assignment.title}
              </Text>

              <View className="flex-row items-center gap-4">
                 <View className="w-12 h-12 rounded-2xl bg-white items-center justify-center shadow-sm">
                    <Ionicons name="book" size={24} color="#10B981" />
                 </View>
                 <View>
                    <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-sm">
                      Nội dung thực hành
                    </Text>
                    <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[11px]">
                      Bài tập đính kèm theo bài giảng
                    </Text>
                 </View>
              </View>
            </View>
          </View>

          {/* File Section */}
          <View className="px-6 mt-10">
             <View className="flex-row items-center justify-between mb-5">
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-lg">Tài liệu đính kèm</Text>
                {assignment.fileUrl && assignment.fileUrl !== "Không có dữ liệu" && (
                   <View className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
             </View>
             
             {(!assignment.fileUrl || assignment.fileUrl === "Không có dữ liệu") ? (
               <View className="bg-white p-10 rounded-[32px] items-center border border-dashed border-gray-200 shadow-sm">
                  <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                     <Ionicons name="folder-open-outline" size={32} color="#D1D5DB" />
                  </View>
                  <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-300 text-sm text-center">Không có file đính kèm</Text>
               </View>
             ) : (
               <TouchableOpacity 
                  onPress={openFileLink} 
                  activeOpacity={0.7}
                  className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex-row items-center"
               >
                  <View className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center mr-4">
                     <Ionicons name="cloud-download" size={28} color="#136ADA" />
                  </View>
                  <View className="flex-1">
                     <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-sm leading-tight" numberOfLines={2}>
                        {assignment.fileTitle && assignment.fileTitle !== "Không có dữ liệu" ? assignment.fileTitle : "Tải tài liệu thực hành"}
                     </Text>
                     <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px] mt-1">
                        Bấm để mở hoặc tải xuống file
                     </Text>
                  </View>
                  <View className="bg-gray-50 w-10 h-10 rounded-2xl items-center justify-center">
                     <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                  </View>
               </TouchableOpacity>
             )}
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
