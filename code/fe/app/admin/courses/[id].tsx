import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";
import { useState, useEffect, useCallback } from "react";
import { courseService } from "../../../services/course.service";
import { lessonService } from "../../../services/lesson.service";
import { CourseResponse } from "../../../types/course";
import { LessonResponse } from "../../../types/lesson";
import { StatusBar } from "expo-status-bar";

export default function AdminCourseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [lessons, setLessons] = useState<LessonResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id || id === "create") return;
    try {
      setLoading(true);
      const [courseData, lessonData] = await Promise.all([
        courseService.getCourseById(id),
        lessonService.getLessons({ courseId: id, pageSize: 100 }),
      ]);
      setCourse(courseData);
      setLessons(lessonData.items || []);
    } catch (err) {
      console.error("Error fetching course detail:", err);
      Alert.alert("Lỗi", "Không thể tải thông tin khóa học.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleUpdateStatus = async (newStatus: "approved" | "rejected") => {
    if (!course) return;
    try {
      setProcessing(true);
      await courseService.updateCourseStatus(course.id, { status: newStatus });
      Alert.alert("Thành công", `Đã ${newStatus === "approved" ? "duyệt" : "từ chối"} khóa học.`);
      router.back();
    } catch (err: any) {
      Alert.alert("Lỗi", err.response?.data?.message || "Không thể cập nhật trạng thái.");
    } finally {
      setProcessing(false);
    }
  };

  const confirmAction = (action: "approved" | "rejected") => {
    Alert.alert(
      action === "approved" ? "Duyệt khóa học" : "Từ chối khóa học",
      `Bạn có chắc chắn muốn ${action === "approved" ? "duyệt" : "từ chối"} khóa học này?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: action === "approved" ? "Duyệt" : "Từ chối",
          style: action === "rejected" ? "destructive" : "default",
          onPress: () => handleUpdateStatus(action),
        },
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#136ADA" />
      </View>
    );
  }

  if (!course) return null;

  return (
    <AdminPageWrapper
      title="Chi tiết duyệt khóa học"
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#136ADA" />}
      >
        {/* Course Info Card */}
        <View className="px-6 pt-6">
          <View className="bg-blue-50/50 p-6 rounded-[40px] border border-blue-100/50">
            <View className="flex-row items-center gap-2 mb-4">
               <View className="bg-blue-100 flex-row items-center px-3 py-1 rounded-full border border-blue-200">
                  <Ionicons name="journal" size={12} color="#136ADA" />
                  <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#136ADA] text-[10px] ml-1 uppercase">
                    {course.subjectName}
                  </Text>
               </View>
               {course.status.toLowerCase() === "approved" ? (
                 <View className="bg-green-100 px-3 py-1 rounded-full border border-green-200">
                    <Text style={{ fontFamily: "Poppins-Bold" }} className="text-green-600 text-[10px]">
                      ĐÃ DUYỆT
                    </Text>
                 </View>
               ) : course.status.toLowerCase() === "pending" ? (
                 <View className="bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
                    <Text style={{ fontFamily: "Poppins-Bold" }} className="text-orange-600 text-[10px]">
                      CHỜ DUYỆT
                    </Text>
                 </View>
               ) : (
                 <View className="bg-red-100 px-3 py-1 rounded-full border border-red-200">
                    <Text style={{ fontFamily: "Poppins-Bold" }} className="text-red-600 text-[10px]">
                      TỪ CHỐI
                    </Text>
                 </View>
               )}
            </View>

            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-2xl text-black mb-4">
              {course.courseName}
            </Text>

            <View className="flex-row items-center gap-3">
               <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center border border-indigo-200">
                  <Text style={{ fontFamily: "Poppins-Bold" }} className="text-indigo-600">
                    {course.teacherName.charAt(0)}
                  </Text>
               </View>
               <View>
                  <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-sm">
                    {course.teacherName}
                  </Text>
                  <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-400 text-[10px]">
                    Giáo viên hướng dẫn
                  </Text>
               </View>
            </View>

            <View className="mt-6 pt-6 border-t border-blue-100/50 flex-row justify-between items-center">
               <View>
                  <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px]">HỌC PHÍ</Text>
                  <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#136ADA] text-xl">
                    {course.price.toLocaleString("vi-VN")}đ
                  </Text>
               </View>
               <View className="items-end">
                  <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px]">BÀI HỌC</Text>
                  <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-700 text-xl">
                    {lessons.length}
                  </Text>
               </View>
            </View>
          </View>
        </View>

        {/* Description Section */}
        <View className="px-6 mt-8">
           <Text style={{ fontFamily: "Poppins-Bold" }} className="text-lg text-black mb-4">Mô tả khóa học</Text>
           <View className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-600 leading-6 text-sm">
                {course.description || "Không có mô tả chi tiết."}
              </Text>
           </View>
        </View>

        {/* Lessons Section */}
        <View className="px-6 mt-8 mb-10">
           <View className="flex-row justify-between items-center mb-4">
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-lg text-black">Nội dung bài học</Text>
              <TouchableOpacity 
                onPress={() => router.push(`/admin/courses/lessons?courseId=${course.id}` as any)}
                className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100"
              >
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#136ADA] text-[10px] uppercase">Xem trước bài học</Text>
              </TouchableOpacity>
           </View>
           {lessons.length === 0 && (
             <View className="bg-gray-50 py-10 rounded-3xl items-center border border-dashed border-gray-300">
                <Ionicons name="list-outline" size={32} color="#D1D5DB" />
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-2">Chưa có bài học nào.</Text>
             </View>
           )}
        </View>
      </ScrollView>

      {/* Action Buttons Overlay */}
      {course.status.toLowerCase() === "pending" && (
        <View className="px-6 py-6 border-t border-gray-100 bg-white flex-row gap-4">
          <TouchableOpacity
            disabled={processing}
            activeOpacity={0.8}
            className="flex-1 bg-red-50 h-16 rounded-[24px] items-center justify-center border border-red-100"
            onPress={() => confirmAction("rejected")}
          >
            {processing ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <Text style={{ fontFamily: "Poppins-Bold", color: "#EF4444", fontSize: 16 }}>Từ chối</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            disabled={processing}
            activeOpacity={0.8}
            className="flex-1 bg-[#136ADA] h-16 rounded-[24px] items-center justify-center shadow-lg shadow-blue-200"
            onPress={() => confirmAction("approved")}
          >
            {processing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ fontFamily: "Poppins-Bold", color: "white", fontSize: 16 }}>Duyệt ngay</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </AdminPageWrapper>
  );
}
