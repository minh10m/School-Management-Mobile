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
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { lessonAssignmentService } from "../../../services/lesson.service";
import { LessonAssignmentResponse } from "../../../types/lesson";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";

export default function AdminLessonAssignmentDetailScreen() {
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

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#136ADA" />
      </View>
    );
  }

  if (!assignment) return null;

  return (
    <AdminPageWrapper title="Chi tiết bài tập">
      <StatusBar style="dark" />
      
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#136ADA" />}
      >
        {/* Assignment Info Card */}
        <View className="px-6 pt-6">
          <View className="bg-emerald-50/50 p-6 rounded-[40px] border border-emerald-100/50">
            <View className="flex-row items-center gap-2 mb-4">
               <View className="bg-emerald-100 flex-row items-center px-3 py-1 rounded-full border border-emerald-200">
                  <Ionicons name="clipboard" size={12} color="#059669" />
                  <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#059669] text-[10px] ml-1 uppercase">
                    BÀI TẬP SỐ {assignment.orderIndex}
                  </Text>
               </View>
            </View>

            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-2xl text-black mb-4">
              {assignment.title}
            </Text>

            <View className="flex-row items-center gap-3">
               <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center border border-emerald-200">
                  <Ionicons name="document-text" size={20} color="#059669" />
               </View>
               <View>
                  <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-sm">
                    Tài liệu bài tập
                  </Text>
                  <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-400 text-[10px]">
                    Học viên tải về để thực hiện
                  </Text>
               </View>
            </View>
          </View>
        </View>

        {/* File Section */}
        <View className="px-6 mt-8">
           <Text style={{ fontFamily: "Poppins-Bold" }} className="text-lg text-black mb-4">File đính kèm</Text>
           
           {(!assignment.fileUrl || assignment.fileUrl === "Không có dữ liệu") ? (
             <View className="bg-gray-50 py-10 rounded-3xl items-center border border-dashed border-gray-300">
                <Ionicons name="document-text-outline" size={32} color="#D1D5DB" />
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-2 text-sm">Chưa có file đính kèm.</Text>
             </View>
           ) : (
             <TouchableOpacity 
                onPress={openFileLink} 
                activeOpacity={0.7}
                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex-row items-center gap-4"
             >
                <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center">
                   <Ionicons name="cloud-download" size={24} color="#3B82F6" />
                </View>
                <View className="flex-1">
                   <Text style={{ fontFamily: "Poppins-Bold" }} className="text-black text-sm" numberOfLines={1}>
                      {assignment.fileTitle && assignment.fileTitle !== "Không có dữ liệu" ? assignment.fileTitle : "Tải xuống tài liệu"}
                   </Text>
                   <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px]" numberOfLines={1}>
                      Bấm để mở hoặc tải về
                   </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
             </TouchableOpacity>
           )}
        </View>

      </ScrollView>
    </AdminPageWrapper>
  );
}

