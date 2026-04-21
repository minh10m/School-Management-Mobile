import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { lessonService, lessonVideoService, lessonAssignmentService } from "../../../services/lesson.service";
import { courseService } from "../../../services/course.service";
import { LessonResponse, LessonVideoResponse, LessonAssignmentResponse } from "../../../types/lesson";
import { VideoPlayer } from "../../../components/ui/VideoPlayer";

const { width } = Dimensions.get("window");
const VIDEO_HEIGHT = (width * 9) / 16;

export default function LessonViewScreen() {
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
        // Pass the fetched data directly to avoid stale state issues
        await selectLesson(lessonToShow, lessonsData.items, enrolled);
      }
    } catch (error) {
      console.error("Error fetching initial lesson data:", error);
      Alert.alert("Lỗi", "Không thể tải nội dung bài học.");
    } finally {
      setLoading(false);
    }
  }, [courseId, previewId]);

  const selectLesson = async (lesson: LessonResponse, allLessons?: LessonResponse[], enrolled?: boolean) => {
    const lessonList = allLessons ?? lessons;
    const enrolledStatus = enrolled ?? isEnrolled;
    
    const idx = lessonList.indexOf(lesson);
    if (!enrolledStatus && idx >= 3) {
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
      // Use existing lessonVideos if available (new API behavior), otherwise fallback to fetch
      if (lesson.lessonVideos && lesson.lessonVideos.length > 0) {
        setVideos(lesson.lessonVideos);
        setActiveVideo(lesson.lessonVideos[0]);
        
        // Still fetch assignments separately (kept for simplicity)
        const assignmentsData = await lessonAssignmentService.getLessonAssignments({ lessonId: lesson.id, pageSize: 10 });
        setAssignments(assignmentsData.items);
      } else {
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

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return "";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s} giây`;
    if (s === 0) return `${m} phút`;
    return `${m} phút ${s} giây`;
  };

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
    <View className="flex-1 bg-white pt-10">
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
      <View 
        className="bg-black"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.5,
          shadowRadius: 15,
          elevation: 10
        }}
      >
        {activeVideo ? (
          <VideoPlayer url={activeVideo.url} autoPlay={true} />
        ) : (
          <View style={{ height: VIDEO_HEIGHT }} className="items-center justify-center bg-[#0F172A]">
            {loading ? (
              <ActivityIndicator color="#3B82F6" />
            ) : (
              <View className="items-center">
                <Ionicons name="videocam-off-outline" size={40} color="#94A3B8" />
                <Text className="text-gray-400 text-xs mt-3">Hiện chưa có video bài giảng</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-gray-100 bg-white">
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
                <View key={lesson.id} className="mb-4">
                  <TouchableOpacity
                    onPress={() => selectLesson(lesson)}
                    activeOpacity={0.7}
                    className={`flex-row items-center p-4 rounded-3xl border ${
                      isActive 
                        ? "bg-blue-50 border-blue-200" 
                        : isLocked ? "bg-gray-50 border-gray-100 opacity-60" : "bg-white border-gray-100"
                    }`}
                    style={(!isActive && !isLocked) ? {
                      shadowColor: "#F1F5F9",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2
                    } : {}}
                  >
                    <View className="relative mr-4">
                      <View 
                        className={`w-12 h-12 rounded-2xl items-center justify-center ${
                          isActive ? "bg-blue-600" : isLocked ? "bg-gray-200" : "bg-gray-100"
                        }`}
                        style={isActive ? {
                          shadowColor: "#2563EB",
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: 5
                        } : {}}
                      >
                        {isLocked ? (
                          <Ionicons name="lock-closed" size={16} color="#94A3B8" />
                        ) : (
                          <Text 
                            className={`text-sm ${isActive ? "text-white" : "text-gray-500"}`}
                            style={{ fontFamily: "Poppins-Bold" }}
                          >
                            {idx + 1}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View className="flex-1">
                      <Text 
                        style={{ fontFamily: isActive ? "Poppins-Bold" : "Poppins-SemiBold" }}
                        className={`text-[15px] ${isActive ? "text-[#1E293B]" : "text-gray-700"}`}
                      >
                        {lesson.lessonName}
                      </Text>
                      {isActive ? (
                        <Text className="text-blue-600 text-[10px] mt-1 font-bold italic tracking-wider">Đang phát</Text>
                      ) : isLocked && (
                        <Text className="text-gray-400 text-[10px] mt-1 italic">Khóa</Text>
                      )}
                    </View>
                    <Ionicons 
                      name={isActive ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={isActive ? "#2563EB" : "#CBD5E1"} 
                    />
                  </TouchableOpacity>

                  {/* Expandable Video List for Active Lesson */}
                  {isActive && lesson.lessonVideos && lesson.lessonVideos.length > 0 && (
                    <View className="mt-2 ml-4 pl-4 border-l-2 border-blue-100">
                      {lesson.lessonVideos.map((video, vIdx) => {
                        const isVideoActive = activeVideo?.id === video.id;
                        return (
                          <TouchableOpacity
                            key={video.id}
                            onPress={() => setActiveVideo(video)}
                            className="flex-row items-center py-3 px-2 mb-2 rounded-xl"
                            style={{ backgroundColor: isVideoActive ? '#F1F5F9' : 'transparent' }}
                          >
                            <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                              isVideoActive ? "bg-blue-600" : "bg-blue-50"
                            }`}>
                              <Ionicons 
                                name={isVideoActive ? "play" : "play-outline"} 
                                size={14} 
                                color={isVideoActive ? "white" : "#3B82F6"} 
                              />
                            </View>
                            <View className="flex-1">
                              <Text 
                                style={{ fontFamily: isVideoActive ? "Poppins-Bold" : "Poppins-Medium" }}
                                className={`text-[13px] ${isVideoActive ? "text-blue-600" : "text-gray-600"}`}
                                numberOfLines={1}
                              >
                                {video.name || `Phần ${vIdx + 1}`}
                              </Text>
                              {video.duration > 0 && (
                                <Text className="text-gray-400 text-[9px] mt-0.5">{formatDuration(video.duration)}</Text>
                              )}
                            </View>
                            {isVideoActive && (
                               <View className="bg-blue-100 px-2 py-0.5 rounded-md">
                                  <Text className="text-blue-600 text-[8px] font-bold">PLAYING</Text>
                               </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
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
    </View>
  );
}
