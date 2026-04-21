import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { lessonService } from "../../../services/lesson.service";
import { getErrorMessage } from "../../../utils/error";

export default function CreateLessonScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const [lessonName, setLessonName] = useState("");
  const [orderIndex, setOrderIndex] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!courseId) {
      Alert.alert("Lỗi", "Thiếu mã khóa học. Không thể tạo bài giảng.");
      return;
    }

    if (!lessonName.trim() || !orderIndex) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    const numericIndex = parseInt(orderIndex, 10);
    if (isNaN(numericIndex) || numericIndex < 1) {
      Alert.alert("Lỗi", "Thứ tự phải là một số nguyên dương hợp lệ.");
      return;
    }

    try {
      setLoading(true);
      await lessonService.createLesson({
        courseId,
        lessonName: lessonName.trim(),
        orderIndex: numericIndex,
      });

      Alert.alert("Thành công", "Tạo bài giảng thành công", [
        { text: "Đồng ý", onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error("Error creating lesson:", error);
      Alert.alert("Lỗi", getErrorMessage(error));
    } finally {
      setLoading(false);
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
          Thêm bài giảng mới
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6 py-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {!courseId ? (
          <View className="items-center py-20">
            <Ionicons name="warning-outline" size={64} color="#EF4444" />
            <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-4 text-center">
              Khóa học không hợp lệ. Vui lòng quay lại và chọn một khóa học hợp lệ.
            </Text>
          </View>
        ) : (
          <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            {/* Input: Lesson Name */}
            <View className="mb-4">
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-700 text-sm mb-1.5 ml-1">
                Tên bài giảng <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={lessonName}
                onChangeText={setLessonName}
                placeholder="VD: Nhập môn Giải tích..."
                placeholderTextColor="#9ca3af"
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-black text-sm"
                style={{ fontFamily: "Poppins-Regular" }}
              />
            </View>

            {/* Input: Order Index */}
            <View className="mb-6">
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-700 text-sm mb-1.5 ml-1">
                Thứ tự <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={orderIndex}
                onChangeText={setOrderIndex}
                placeholder="e.g., 1, 2, 3..."
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-black text-sm"
                style={{ fontFamily: "Poppins-Regular" }}
              />
              <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-400 text-[10px] mt-1.5 ml-1">
                Số thứ tự quyết định trình tự hiển thị của các bài giảng trong khóa học.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleCreate}
              disabled={loading}
              className={`rounded-2xl py-4 items-center flex-row justify-center ${
                loading ? "bg-indigo-300" : "bg-indigo-600"
              }`}
              style={{ shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="white" className="mr-2" />
                  <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white text-base ml-2">
                    Tạo bài giảng
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
