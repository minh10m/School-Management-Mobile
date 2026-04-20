import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { lessonService, lessonVideoService, lessonAssignmentService } from "../../../services/lesson.service";
import { LessonResponse, LessonVideoResponse, LessonAssignmentResponse } from "../../../types/lesson";
import { getErrorMessage } from "../../../utils/error";
import { VideoPlayer } from "../../../components/ui/VideoPlayer";

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [videos, setVideos] = useState<LessonVideoResponse[]>([]);
  const [assignments, setAssignments] = useState<LessonAssignmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  // Modals state
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [assignmentModalVisible, setAssignmentModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Video Form
  const [videoName, setVideoName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState("");
  const [videoIsPreview, setVideoIsPreview] = useState(false);

  // Assignment Form
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentFileUrl, setAssignmentFileUrl] = useState("");
  const [assignmentFileTitle, setAssignmentFileTitle] = useState("");

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
    }
  }, [id]);

  useEffect(() => {
    fetchLessonDetails();
  }, [fetchLessonDetails]);

  const handleCreateVideo = async () => {
    if (!videoName.trim() || !videoUrl.trim() || !videoDuration) {
      Alert.alert("Lỗi", "Vui lòng nhập Tên, URL và Thời lượng.");
      return;
    }
    try {
      setSubmitting(true);
      await lessonVideoService.createLessonVideo({
        lessonId: id,
        name: videoName.trim(),
        url: videoUrl.trim(),
        duration: Number(videoDuration),
        isPreview: videoIsPreview,
        orderIndex: videos.length + 1,
      });
      Alert.alert("Thành công", "Đã thêm video thành công");
      setVideoModalVisible(false);
      // Reset form
      setVideoName("");
      setVideoUrl("");
      setVideoDuration("");
      setVideoIsPreview(false);
      fetchLessonDetails();
    } catch (error: any) {
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!assignmentTitle.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập Tiêu đề bài tập.");
      return;
    }
    try {
      setSubmitting(true);
      await lessonAssignmentService.createLessonAssignment({
        lessonId: id,
        title: assignmentTitle.trim(),
        fileUrl: assignmentFileUrl.trim() || undefined,
        fileTitle: assignmentFileTitle.trim() || undefined,
        orderIndex: assignments.length + 1,
      });
      Alert.alert("Thành công", "Đã tạo bài tập thành công");
      setAssignmentModalVisible(false);
      // Reset form
      setAssignmentTitle("");
      setAssignmentFileUrl("");
      setAssignmentFileTitle("");
      fetchLessonDetails();
    } catch (error: any) {
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar hidden />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-black text-lg">
          Chi tiết bài giảng
        </Text>
        <View className="w-10" />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : lesson ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Lesson Metadata */}
          <View className="bg-[#136ADA] px-6 py-10 rounded-b-[40px] shadow-sm mb-8 relative overflow-hidden">
            {/* Background decoration */}
            <View className="absolute right-[-20] top-5 w-40 h-40 bg-white/10 rounded-full" />

            <Text
              style={{ fontFamily: "Poppins-Bold" }}
              className="text-white text-2xl mb-1 z-10"
            >
              {lesson.lessonName}
            </Text>
            <View className="flex-row items-center mt-3 z-10">
              <View className="bg-white/20 px-3 py-1 rounded-full flex-row items-center gap-1.5">
                <Ionicons name="list-outline" size={14} color="white" />
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-white text-[10px] uppercase tracking-widest"
                >
                  Thứ tự: {lesson.orderIndex}
                </Text>
              </View>
            </View>
          </View>

          {/* Videos Section */}
          <View className="px-6 mb-8">
            <View className="flex-row justify-between items-center mb-5">
              <View>
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-gray-800 text-lg"
                >
                  Video bài giảng
                </Text>
                <Text
                  style={{ fontFamily: "Poppins-Medium" }}
                  className="text-gray-400 text-[10px] uppercase tracking-widest"
                >
                  {videos.length} tài liệu video
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setVideoModalVisible(true)}
                className="bg-blue-50 w-10 h-10 rounded-2xl items-center justify-center"
              >
                <Ionicons name="add" size={24} color="#136ADA" />
              </TouchableOpacity>
            </View>

            {activeVideoUrl && (
              <View className="mb-8 bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center gap-2">
                    <View className="w-2 h-2 bg-blue-500 rounded-full" />
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-[#136ADA] text-[10px] uppercase tracking-widest"
                    >
                      Đang xem thử
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setActiveVideoUrl(null)}
                    className="bg-gray-50 px-3 py-1 rounded-lg"
                  >
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-gray-400 text-[10px]"
                    >
                      ĐÓNG
                    </Text>
                  </TouchableOpacity>
                </View>
                <View className="rounded-2xl overflow-hidden">
                  <VideoPlayer url={activeVideoUrl} autoPlay />
                </View>
              </View>
            )}

            {videos.length === 0 ? (
              <View className="bg-white p-8 rounded-[32px] border border-gray-100 items-center justify-center border-dashed">
                <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-4">
                  <Ionicons name="videocam-outline" size={32} color="#136ADA" />
                </View>
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-gray-300 text-sm"
                >
                  Chưa có video bài học
                </Text>
              </View>
            ) : (
              videos.map((video) => (
                <TouchableOpacity
                  key={video.id}
                  onPress={() => setActiveVideoUrl(video.url)}
                  activeOpacity={0.7}
                  className={`bg-white p-4 rounded-2xl border ${activeVideoUrl === video.url ? "border-[#136ADA] shadow-md shadow-blue-100" : "border-gray-100 shadow-sm"} flex-row items-center mb-4`}
                >
                  <View
                    className={`w-12 h-12 ${activeVideoUrl === video.url ? "bg-blue-50" : "bg-gray-50"} rounded-xl items-center justify-center mr-4`}
                  >
                    <Ionicons
                      name={activeVideoUrl === video.url ? "pause" : "play"}
                      size={24}
                      color={activeVideoUrl === video.url ? "#136ADA" : "#9ca3af"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-gray-800 text-sm"
                      numberOfLines={1}
                    >
                      {video.name}
                    </Text>
                    <Text
                      style={{ fontFamily: "Poppins-Medium" }}
                      className="text-gray-400 text-[10px]"
                    >
                      Thời lượng: {(video.duration / 60).toFixed(1)} phút
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Assignments Section */}
          <View className="px-6 mb-8">
            <View className="flex-row justify-between items-center mb-5">
              <View>
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-gray-800 text-lg"
                >
                  Bài tập đính kèm
                </Text>
                <Text
                  style={{ fontFamily: "Poppins-Medium" }}
                  className="text-gray-400 text-[10px] uppercase tracking-widest"
                >
                  {assignments.length} phần thực hành
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setAssignmentModalVisible(true)}
                className="bg-green-50 w-10 h-10 rounded-2xl items-center justify-center"
              >
                <Ionicons name="add" size={24} color="#22C55E" />
              </TouchableOpacity>
            </View>

            {assignments.length === 0 ? (
              <View className="bg-white p-8 rounded-[32px] border border-gray-100 items-center justify-center border-dashed">
                <View className="w-16 h-16 bg-green-50 rounded-full items-center justify-center mb-4">
                  <Ionicons
                    name="document-text-outline"
                    size={32}
                    color="#22C55E"
                  />
                </View>
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-gray-300 text-sm"
                >
                  Chưa có bài tập cho bài này
                </Text>
              </View>
            ) : (
              assignments.map((assignment) => (
                <TouchableOpacity
                  key={assignment.id}
                  onPress={() => {
                    router.push(`/teacher/lesson-assignments/${assignment.id}` as any);
                  }}
                  activeOpacity={0.7}
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex-row items-center mb-4"
                >
                  <View className="w-12 h-12 bg-green-50 rounded-xl items-center justify-center mr-4">
                    <Ionicons name="reader" size={24} color="#22C55E" />
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-gray-800 text-sm"
                      numberOfLines={1}
                    >
                      {assignment.title}
                    </Text>
                    <Text
                      style={{ fontFamily: "Poppins-Medium" }}
                      className="text-gray-400 text-[10px]"
                      numberOfLines={1}
                    >
                      {assignment.fileTitle || "Tài liệu hệ thống"}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500">
            Không tìm thấy bài giảng.
          </Text>
        </View>
      )}

      {/* Video Modal */}
      <Modal visible={videoModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 min-h-[60%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-xl text-black">Thêm Video</Text>
              <TouchableOpacity onPress={() => setVideoModalVisible(false)}>
                <Ionicons name="close-circle-outline" size={28} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View className="mb-4">
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-700 text-sm mb-1.5 ml-1">Tên Video</Text>
              <TextInput value={videoName} onChangeText={setVideoName} placeholder="VD: Phần 1: Giới thiệu" className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-black" />
            </View>

            <View className="mb-4">
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-700 text-sm mb-1.5 ml-1">URL Video</Text>
              <TextInput value={videoUrl} onChangeText={setVideoUrl} placeholder="VD: https://youtube.com/..." className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-black" />
            </View>

            <View className="mb-4">
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-700 text-sm mb-1.5 ml-1">Thời lượng (giây)</Text>
              <TextInput value={videoDuration} onChangeText={setVideoDuration} keyboardType="numeric" placeholder="VD: 180" className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-black" />
            </View>

            <View className="mb-6 flex-row items-center justify-between">
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-700 text-sm ml-1">Cho phép xem trước?</Text>
              <Switch value={videoIsPreview} onValueChange={setVideoIsPreview} trackColor={{ true: '#4F46E5' }} />
            </View>

            <TouchableOpacity
              onPress={handleCreateVideo}
              disabled={submitting}
              className={`rounded-2xl py-4 items-center ${submitting ? "bg-indigo-300" : "bg-indigo-600"}`}
            >
              {submitting ? <ActivityIndicator color="white" /> : <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white">Lưu Video</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Assignment Modal */}
      <Modal visible={assignmentModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 min-h-[60%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-xl text-black">Thêm bài tập (Bài giảng)</Text>
              <TouchableOpacity onPress={() => setAssignmentModalVisible(false)}>
                <Ionicons name="close-circle-outline" size={28} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View className="mb-4">
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-700 text-sm mb-1.5 ml-1">Tiêu đề</Text>
              <TextInput value={assignmentTitle} onChangeText={setAssignmentTitle} placeholder="VD: Bài tập số 1" className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-black" />
            </View>

            <View className="mb-4">
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-700 text-sm mb-1.5 ml-1">Tên tài liệu (tùy chọn)</Text>
              <TextInput value={assignmentFileTitle} onChangeText={setAssignmentFileTitle} placeholder="VD: File PDF hướng dẫn" className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-black" />
            </View>

            <View className="mb-6">
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-700 text-sm mb-1.5 ml-1">URL tài liệu (Tùy chọn)</Text>
              <TextInput value={assignmentFileUrl} onChangeText={setAssignmentFileUrl} placeholder="VD: https://docs..." className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-black" />
            </View>

            <TouchableOpacity
              onPress={handleCreateAssignment}
              disabled={submitting}
              className={`rounded-2xl py-4 items-center ${submitting ? "bg-emerald-300" : "bg-emerald-600"}`}
            >
              {submitting ? <ActivityIndicator color="white" /> : <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white">Lưu bài tập</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
