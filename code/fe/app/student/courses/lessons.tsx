import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { lessonService, lessonVideoService, lessonAssignmentService } from "../../../services/lesson.service";
import { courseService } from "../../../services/course.service";
import { LessonResponse, LessonVideoResponse, LessonAssignmentResponse } from "../../../types/lesson";
import { VideoPlayer } from "../../../components/ui/VideoPlayer";

const { width } = Dimensions.get("window");
const VIDEO_HEIGHT = (width * 9) / 16;

export default function LessonViewScreen() {
  const router = useRouter();
  const { courseId, previewId } = useLocalSearchParams<{ courseId: string; previewId?: string }>();
  
  const [lessons, setLessons] = useState<LessonResponse[]>([]);
  const [currentLesson, setCurrentLesson] = useState<LessonResponse | null>(null);
  const [videos, setVideos] = useState<LessonVideoResponse[]>([]);
  const [activeVideo, setActiveVideo] = useState<LessonVideoResponse | null>(null);
  const [assignments, setAssignments] = useState<LessonAssignmentResponse[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"content" | "assignments">("content");

  const fetchInitialData = useCallback(async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      // Fetch data in parallel
      const [lessonsData, registeredData] = await Promise.all([
        lessonService.getLessons({ courseId, pageSize: 50 }),
        courseService.getRegisteredCourses()
      ]);
      
      setLessons(lessonsData.items);
      const enrolled = registeredData.items.some(c => c.id === courseId);
      setIsEnrolled(enrolled);

      // determine which lesson to show first
      let lessonToShow = lessonsData.items[0];
      if (previewId) {
        const found = lessonsData.items.find(l => l.id === previewId);
        if (found) lessonToShow = found;
      }
      
      if (lessonToShow) {
        // If not enrolled and trying to preview a locked lesson, show the first one instead
        const idx = lessonsData.items.indexOf(lessonToShow);
        if (!enrolled && idx >= 3) {
          lessonToShow = lessonsData.items[0];
        }
        await selectLesson(lessonToShow);
      }
    } catch (error) {
      console.error("Error fetching initial lesson data:", error);
      Alert.alert("Lỗi", "Không thể tải nội dung bài học.");
    } finally {
      setLoading(false);
    }
  }, [courseId, previewId]);

  const selectLesson = async (lesson: LessonResponse) => {
    const idx = lessons.indexOf(lesson);
    if (!isEnrolled && idx >= 3) {
      Alert.alert(
        "Khóa học đã bị khóa",
        "Bạn chỉ có thể xem thử 3 bài học đầu tiên. Vui lòng đăng ký khóa học để mở khóa toàn bộ nội dung.",
        [
          { text: "Để sau", style: "cancel" },
          { text: "Đăng ký ngay", onPress: () => router.push(`/student/courses/${courseId}` as any) }
        ]
      );
      return;
    }

    setCurrentLesson(lesson);
    setLoading(true);
    try {
      const [videosData, assignmentsData] = await Promise.all([
        lessonVideoService.getLessonVideos({ lessonId: lesson.id, pageSize: 10 }),
        lessonAssignmentService.getLessonAssignments({ lessonId: lesson.id, pageSize: 10 })
      ]);
      setVideos(videosData.items);
      setAssignments(assignmentsData.items);
      if (videosData.items.length > 0) {
        setActiveVideo(videosData.items[0]);
      } else {
        setActiveVideo(null);
      }
    } catch (error) {
      console.error("Error selecting lesson:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }
    }
    return url;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#1E293B] text-base" numberOfLines={1}>
            {currentLesson?.lessonName || "Đang tải bài giảng..."}
          </Text>
          <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px] uppercase tracking-widest">
            {previewId ? "Chế độ học thử" : "Khóa học của tôi"}
          </Text>
        </View>
      </View>

      {/* Video Player Section */}
      <View className="bg-black">
        {activeVideo ? (
          <VideoPlayer url={activeVideo.url} autoPlay={true} />
        ) : (
          <View style={{ height: VIDEO_HEIGHT }} className="items-center justify-center">
            {loading ? (
              <ActivityIndicator color="#3B82F6" />
            ) : (
              <Text className="text-white text-xs">Hiện chưa có video bài giảng</Text>
            )}
          </View>
        )}
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-gray-50">
        <TouchableOpacity 
          onPress={() => setTab("content")}
          className={`flex-1 py-4 border-b-2 ${tab === "content" ? "border-blue-600" : "border-transparent"}`}
        >
          <Text 
            style={{ fontFamily: tab === "content" ? "Poppins-Bold" : "Poppins-Medium" }} 
            className={`text-center text-xs ${tab === "content" ? "text-blue-600" : "text-gray-400"}`}
          >
            NỘI DUNG
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setTab("assignments")}
          className={`flex-1 py-4 border-b-2 ${tab === "assignments" ? "border-blue-600" : "border-transparent"}`}
        >
          <Text 
            style={{ fontFamily: tab === "assignments" ? "Poppins-Bold" : "Poppins-Medium" }} 
            className={`text-center text-xs ${tab === "assignments" ? "text-blue-600" : "text-gray-400"}`}
          >
            BÀI TẬP ({assignments.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {tab === "content" ? (
          <View className="px-5 py-6">
            {/* Playlist Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#1E293B] text-base">Danh sách bài giảng</Text>
              <Text className="text-gray-400 text-[10px]">{lessons.length} bài học</Text>
            </View>

            {/* List */}
            {lessons.map((lesson, idx) => {
              const isLocked = !isEnrolled && idx >= 3;
              const isActive = currentLesson?.id === lesson.id;
              
              return (
                <TouchableOpacity
                  key={lesson.id}
                  onPress={() => selectLesson(lesson)}
                  className={`flex-row items-center p-4 rounded-2xl mb-3 border ${
                    isActive 
                      ? "bg-blue-50 border-blue-100" 
                      : isLocked ? "bg-gray-50 border-gray-100 opacity-60" : "bg-white border-gray-100"
                  }`}
                >
                  <View className="relative mr-4">
                    <View className={`w-10 h-10 rounded-full items-center justify-center ${
                      isActive ? "bg-blue-600" : isLocked ? "bg-gray-200" : "bg-gray-100"
                    }`}>
                      {isLocked ? (
                        <Ionicons name="lock-closed" size={14} color="#94A3B8" />
                      ) : (
                        <Text 
                          className={`text-xs ${isActive ? "text-white" : "text-gray-500"}`}
                          style={{ fontFamily: "Poppins-Bold" }}
                        >
                          {idx + 1}
                        </Text>
                      )}
                    </View>
                    {isLocked && (
                      <View className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 border border-gray-100">
                        <Ionicons name="lock-closed" size={10} color="#F87171" />
                      </View>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text 
                      style={{ fontFamily: isActive ? "Poppins-Bold" : "Poppins-Medium" }}
                      className={`text-sm ${isActive ? "text-[#1E293B]" : "text-gray-600"}`}
                    >
                      {lesson.lessonName}
                    </Text>
                    {isActive ? (
                      <Text className="text-blue-600 text-[10px] mt-1">Đang phát</Text>
                    ) : isLocked && (
                      <Text className="text-gray-400 text-[10px] mt-1 italic">Vui lòng đăng ký để mở khóa</Text>
                    )}
                  </View>
                  <Ionicons 
                    name={isActive ? "pause-circle" : isLocked ? "lock-closed" : "play-circle"} 
                    size={24} 
                    color={isActive ? "#2563EB" : isLocked ? "#94A3B8" : "#CBD5E1"} 
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View className="px-5 py-6">
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <View key={assignment.id} className="bg-white border border-gray-100 p-5 rounded-3xl mb-4">
                  <View className="flex-row items-center mb-4">
                    <View className="w-10 h-10 bg-indigo-50 rounded-2xl items-center justify-center mr-4">
                      <Ionicons name="document-text" size={20} color="#6366F1" />
                    </View>
                    <View className="flex-1">
                      <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#1E293B] text-sm">{assignment.title}</Text>
                      <Text className="text-gray-400 text-[10px]">Định dạng: {assignment.fileTitle || "PDF/Tài liệu"}</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    className="bg-gray-50 py-3 rounded-2xl flex-row items-center justify-center border border-dashed border-gray-200"
                    onPress={() => {
                      if (isEnrolled) {
                        if (assignment.fileUrl) {
                          Linking.openURL(assignment.fileUrl);
                        } else {
                          Alert.alert("Thông báo", "Bài tập này hiện chưa đính kèm file tài liệu.");
                        }
                      } else {
                        Alert.alert("Thông báo", "Bạn cần đăng ký khóa học để tải tài liệu bài tập.");
                      }
                    }}
                  >
                    <Ionicons name="download-outline" size={18} color="#64748B" className="mr-2" />
                    <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#64748B] text-xs ml-2">Tải tài liệu</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View className="items-center justify-center py-20">
                <Ionicons name="folder-open-outline" size={48} color="#E2E8F0" />
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-4 text-xs">Không có bài tập cho bài giảng này</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
