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
import { lessonVideoService } from "../../../services/lesson.service";
import { getErrorMessage } from "../../../utils/error";

export default function AddVideoScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();

  const [videoName, setVideoName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchVideoDuration = async (url: string) => {
    try {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const response = await fetch(url);
        const text = await response.text();
        const match = text.match(/"lengthSeconds":"(\d+)"/);
        if (match && match[1]) {
          return parseInt(match[1], 10);
        }
      }
    } catch (e) {
      console.log('Error fetching youtube duration', e);
    }
    return 1; // Default to 1 if not youtube or failed
  };

  const handleCreateVideo = async () => {
    if (!videoName.trim() || !videoUrl.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập Tên và URL Video.");
      return;
    }
    if (!lessonId) {
      Alert.alert("Lỗi", "Không tìm thấy bài giảng.");
      return;
    }
    try {
      setSubmitting(true);
      
      // Calculate duration automatically if it's a YouTube link
      const calculatedDuration = await fetchVideoDuration(videoUrl.trim());
      
      await lessonVideoService.createLessonVideo({
        lessonId: lessonId,
        name: videoName.trim(),
        url: videoUrl.trim(),
        duration: calculatedDuration,
        isPreview: false,
        orderIndex: 99, // Backend should handle exact ordering if needed
      });
      Alert.alert("Thành công", "Đã thêm video thành công");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", getErrorMessage(error));
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
          Thêm Video Khóa Học
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
                Tên Video
              </Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 py-1 shadow-sm shadow-gray-100">
                <Ionicons
                  name="play-circle-outline"
                  size={20}
                  color="#64748B"
                  className="mr-2"
                />
                <TextInput
                  value={videoName}
                  onChangeText={setVideoName}
                  placeholder="VD: Phần 1: Giới thiệu"
                  className="flex-1 py-3.5 text-gray-800 font-medium"
                  style={{ fontFamily: "Poppins-Regular" }}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View className="mb-8">
              <Text
                style={{ fontFamily: "Poppins-SemiBold" }}
                className="text-gray-700 text-sm mb-2 ml-1"
              >
                URL Video (Youtube/Drive)
              </Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 py-1 shadow-sm shadow-gray-100">
                <Ionicons
                  name="link-outline"
                  size={20}
                  color="#64748B"
                  className="mr-2"
                />
                <TextInput
                  value={videoUrl}
                  onChangeText={setVideoUrl}
                  placeholder="VD: https://youtube.com/..."
                  className="flex-1 py-3.5 text-gray-800 font-medium"
                  style={{ fontFamily: "Poppins-Regular" }}
                  returnKeyType="done"
                  onSubmitEditing={handleCreateVideo}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleCreateVideo}
              disabled={submitting}
              className={`rounded-2xl py-4 flex-row justify-center items-center ${submitting ? "bg-indigo-400" : "bg-indigo-600"} shadow-md shadow-indigo-200 mt-4`}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="white" className="mr-2" />
                  <Text
                    style={{ fontFamily: "Poppins-Bold" }}
                    className="text-white text-base ml-2 mt-0.5"
                  >
                    Lưu Video
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
