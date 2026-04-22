import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, Stack, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { assignmentService } from "../../../../services/assignment.service";
import { AssignmentResponse } from "../../../../types/assignment";

export default function AssignmentDetailPage() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<AssignmentResponse | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await assignmentService.getAssignmentById(id as string);
      setAssignment(data);
    } catch (error) {
      console.error("Error fetching assignment detail:", error);
      Alert.alert("Lỗi", "Không thể tải chi tiết bài tập");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [fetchDetail])
  );

  const handleOpenFile = async (url: string | null) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Lỗi", "Không thể mở liên kết này");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Đã có lỗi xảy ra");
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#136ADA" />
      </SafeAreaView>
    );
  }

  if (!assignment) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#E5E7EB" />
        <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-4 text-center">
          Không tìm thấy nội dung bài tập
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-blue-600 px-8 py-3 rounded-2xl">
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white">Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const startDate = new Date(assignment.startTime);
  const endDate = new Date(assignment.finishTime);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#1E293B] text-lg" numberOfLines={1}>
            Chi tiết bài tập
          </Text>
          <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[11px] uppercase">
            {assignment.subjectName} • {assignment.className}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push({
            pathname: "/teacher/my-class/edit-assignment/[id]",
            params: { id }
          } as any)}
          className="bg-blue-600 w-10 h-10 rounded-2xl items-center justify-center shadow-lg shadow-blue-200"
        >
          <Ionicons name="create-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false}>
        {/* Title & Status */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-1 mr-4">
            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-2xl text-[#1E293B] leading-tight">
              {assignment.title}
            </Text>
          </View>
          <View className="bg-emerald-50 px-3 py-1.5 rounded-xl">
            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-emerald-600 text-[10px] uppercase">
              Đang diễn ra
            </Text>
          </View>
        </View>

        {/* Date Info */}
        <View className="flex-row bg-gray-50 rounded-[32px] p-6 mb-8 gap-x-8">
          <View className="flex-1">
            <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px] uppercase mb-1">
              Bắt đầu
            </Text>
            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#1E293B] text-sm">
              {startDate.toLocaleDateString("vi-VN")}
            </Text>
          </View>
          <View className="w-[1px] bg-gray-200 h-full" />
          <View className="flex-1">
            <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px] uppercase mb-1">
              Hạn nộp
            </Text>
            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-rose-500 text-sm">
              {endDate.toLocaleDateString("vi-VN")}
            </Text>
          </View>
        </View>

        {/* Description Section */}
        <View className="mb-10">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-3">
              <Ionicons name="reader-outline" size={18} color="#1D4ED8" />
            </View>
            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#1E293B] text-lg">
              Yêu cầu & Mô tả
            </Text>
          </View>
          <View className="bg-blue-50/30 p-6 rounded-[32px] border border-blue-50">
            <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-700 leading-relaxed text-sm">
              {assignment.description || "Không có mô tả chi tiết cho bài tập này."}
            </Text>
          </View>
        </View>

        {/* Attachment Section */}
        {assignment.fileUrl && (
          <View className="mb-10">
            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#1E293B] text-base mb-4 ml-1">
              Tài liệu liên quan
            </Text>
            <TouchableOpacity
              onPress={() => handleOpenFile(assignment.fileUrl)}
              className="bg-white border border-gray-100 p-5 rounded-[32px] flex-row items-center shadow-sm shadow-gray-100"
            >
              <View className="w-12 h-12 bg-rose-50 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="document-text" size={24} color="#E11D48" />
              </View>
              <View className="flex-1">
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-sm mb-1" numberOfLines={1}>
                  {assignment.fileTitle || "Tên tài liệu không xác định"}
                </Text>
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px]">
                  Bấm để xem chi tiết tài liệu
                </Text>
              </View>
              <Ionicons name="download-outline" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          onPress={() => router.push({
            pathname: "/teacher/my-class/submissions/[assignmentId]",
            params: { assignmentId: id, title: assignment.title }
          } as any)}
          className="bg-blue-600 p-5 rounded-[24px] flex-row items-center justify-center mb-20 shadow-lg shadow-blue-200"
        >
          <Ionicons name="list" size={20} color="white" />
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white text-base ml-2">
            Xem danh sách bài nộp
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
