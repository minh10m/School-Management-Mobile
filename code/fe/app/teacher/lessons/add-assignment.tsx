import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as DocumentPicker from "expo-document-picker";
import { lessonAssignmentService } from "../../../services/lesson.service";
import { getErrorMessage } from "../../../utils/error";

export default function AddAssignmentScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();

  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [assignmentFileUrl, setAssignmentFileUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        setSelectedFile(result);
      }
    } catch (err) {
      console.log("Error picking document:", err);
    }
  };

  const handleCreateAssignment = async () => {
    if (!assignmentTitle.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập Tiêu đề bài tập.");
      return;
    }
    if (!assignmentDescription.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập Mô tả bài tập.");
      return;
    }
    if (!lessonId) {
      Alert.alert("Lỗi", "Không tìm thấy bài giảng.");
      return;
    }

    try {
      setSubmitting(true);
      const fileAsset = selectedFile && !selectedFile.canceled ? selectedFile.assets[0] : null;

      await lessonAssignmentService.createLessonAssignment({
        lessonId: lessonId,
        title: assignmentTitle.trim(),
        description: assignmentDescription.trim(),
        fileUrl: assignmentFileUrl.trim() || undefined,
        fileTitle: fileAsset ? fileAsset.name : undefined,
        orderIndex: 99,
        file: fileAsset
          ? {
              uri: fileAsset.uri,
              name: fileAsset.name,
              type: fileAsset.mimeType || "application/octet-stream",
            }
          : undefined,
      });

      Alert.alert("Thành công", "Đã thêm bài tập thành công");
      router.back();
    } catch (error: any) {
      Alert.alert("Lỗi", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white px-5 pt-2 pb-4 z-10 border-b border-gray-100 flex-row items-center justify-between">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className="text-lg text-gray-800"
        >
          Thêm Bài Tập
        </Text>
        <View className="w-10" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1 px-5 pt-6"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View className="mb-6">
              <Text
                style={{ fontFamily: "Poppins-SemiBold" }}
                className="text-gray-700 text-sm mb-2 ml-1"
              >
                Tiêu đề bài tập
              </Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 py-1 shadow-sm shadow-gray-100">
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#64748B"
                  className="mr-2"
                />
                <TextInput
                  value={assignmentTitle}
                  onChangeText={setAssignmentTitle}
                  placeholder="VD: Bài tập thực hành số 1"
                  className="flex-1 py-3.5 text-gray-800 font-medium"
                  style={{ fontFamily: "Poppins-Regular" }}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View className="mb-6">
              <Text
                style={{ fontFamily: "Poppins-SemiBold" }}
                className="text-gray-700 text-sm mb-2 ml-1"
              >
                Mô tả chi tiết
              </Text>
              <View className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm shadow-gray-100">
                <TextInput
                  value={assignmentDescription}
                  onChangeText={setAssignmentDescription}
                  placeholder="VD: Hoàn thành các câu hỏi trắc nghiệm..."
                  multiline
                  numberOfLines={4}
                  className="text-gray-800 font-medium min-h-[100px]"
                  style={{ fontFamily: "Poppins-Regular" }}
                  textAlignVertical="top"
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>
            </View>

            <View className="mb-6">
              <Text
                style={{ fontFamily: "Poppins-SemiBold" }}
                className="text-gray-700 text-sm mb-2 ml-1"
              >
                Tài liệu đính kèm (File)
              </Text>
              <TouchableOpacity
                onPress={handlePickDocument}
                className="bg-emerald-50/50 border border-emerald-200 border-dashed rounded-2xl p-6 items-center justify-center relative shadow-sm shadow-gray-50"
              >
                <View className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center mb-3">
                  <Ionicons name="cloud-upload" size={24} color="#059669" />
                </View>
                <Text
                  style={{ fontFamily: "Poppins-SemiBold" }}
                  className="text-emerald-700 text-center"
                >
                  {selectedFile && !selectedFile.canceled
                    ? selectedFile.assets[0].name
                    : "Nhấn để chọn tài liệu từ máy"}
                </Text>
                {selectedFile && !selectedFile.canceled && (
                  <Text
                    style={{ fontFamily: "Poppins-Regular" }}
                    className="text-emerald-600/70 text-[11px] mt-1 text-center"
                  >
                    {(selectedFile.assets[0].size! / 1024 / 1024).toFixed(2)} MB
                  </Text>
                )}
                {selectedFile && !selectedFile.canceled && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="absolute top-3 right-3 bg-red-100 p-1.5 rounded-full"
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>

            <View className="mb-8">
              <Text
                style={{ fontFamily: "Poppins-SemiBold" }}
                className="text-gray-700 text-sm mb-2 ml-1"
              >
                Hoặc đường dẫn tài liệu (URL)
              </Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 py-1 shadow-sm shadow-gray-100">
                <Ionicons
                  name="link"
                  size={20}
                  color="#64748B"
                  className="mr-2"
                />
                <TextInput
                  value={assignmentFileUrl}
                  onChangeText={setAssignmentFileUrl}
                  placeholder="VD: https://docs.google.com/..."
                  className="flex-1 py-3.5 text-gray-800 font-medium"
                  style={{ fontFamily: "Poppins-Regular" }}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleCreateAssignment}
              disabled={submitting}
              className={`rounded-2xl py-4 flex-row justify-center items-center ${submitting ? "bg-emerald-400" : "bg-emerald-600"} shadow-md shadow-emerald-200 mt-2 mb-10`}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons
                    name="save-outline"
                    size={20}
                    color="white"
                    className="mr-2"
                  />
                  <Text
                    style={{ fontFamily: "Poppins-Bold" }}
                    className="text-white text-base ml-2 mt-0.5"
                  >
                    Lưu Bài Tập
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
