import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useCallback } from "react";
import { courseService } from "../../../services/course.service";
import { lessonService } from "../../../services/lesson.service";
import { paymentService } from "../../../services/payment.service";
import { usePaymentHub } from "../../../hooks/usePaymentHub";
import { CourseResponse } from "../../../types/course";
import { LessonResponse } from "../../../types/lesson";
import { PaymentResponse } from "../../../types/payment";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Modal, Image } from "react-native";
import { useRef } from "react";

export default function StudentCourseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [firstLesson, setFirstLesson] = useState<LessonResponse | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentResponse | null>(null);

  const insets = useSafeAreaInsets();

  const { isConnected: isSignalRConnected } = usePaymentHub((status) => {
    if (status.status === "Success") {
      setShowQR(false);
      setIsEnrolled(true);
      router.push({
        pathname: "/payment/success",
        params: { 
          courseId: id,
          courseName: course?.courseName || ""
        }
      });
    } else {
      Alert.alert("Thanh toán thất bại", status.message);
    }
  }, showQR);

  const fetchCourseDetail = useCallback(async () => {
    if (!id || id === "lessons" || id === "create") return;
    try {
      setLoading(true);
      const [data, registered, lessonsResult] = await Promise.all([
        courseService.getCourseById(id),
        courseService.getRegisteredCourses(),
        lessonService.getLessons({ courseId: id, pageSize: 1, pageNumber: 1 }),
      ]);
      setCourse(data);
      setIsEnrolled(registered.items.some((c) => c.id === id));
      if (lessonsResult.items && lessonsResult.items.length > 0) {
        setFirstLesson(lessonsResult.items[0]);
      }
    } catch (error) {
      console.error("Error fetching course detail:", error);
      Alert.alert("Lỗi", "Không thể tải chi tiết khóa học.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourseDetail();
  }, [fetchCourseDetail]);


  const handleRegister = async () => {
    if (isEnrolled) {
      // Logic để vào xem bài học (giả sử là push qua màn danh sách bài học)
      router.push(`/student/courses/lessons?courseId=${id}` as any);
      return;
    }

    try {
      setIsRegistering(true);
      const response = await paymentService.payTheBill({
        courseId: id as string,
      });
      setPaymentInfo(response);
      setShowQR(true);
    } catch (err: any) {
      if (err.response?.data?.message === "YOU_BUY_THIS_COURSE") {
        setIsEnrolled(true);
        Alert.alert("Thông báo", "Bạn đã đăng ký khóa học này rồi.");
      } else {
        Alert.alert("Lỗi", "Không thể khởi tạo đăng ký. Vui lòng thử lại sau.");
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-gray-100 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className="text-black text-lg"
        >
          Chi tiết khóa học
        </Text>
        <View className="w-10" />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : course ? (
        <View className="flex-1">
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 150 }}
          >
            {/* Course Info */}
            <View className="px-6 pt-8 bg-white">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <View className="bg-orange-500 px-3 py-1.5 rounded-full shadow-sm shadow-orange-100">
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-white text-[10px] uppercase tracking-widest"
                    >
                      {course.subjectName}
                    </Text>
                  </View>
                  <View className="bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-blue-500 text-[10px] uppercase tracking-widest"
                    >
                      Lớp 12
                    </Text>
                  </View>
                </View>
                <Text
                  style={{ fontFamily: "Poppins-Medium" }}
                  className="text-gray-400 text-[10px] uppercase tracking-widest"
                >
                  {new Date(course.createdAt).toLocaleDateString("vi-VN")}
                </Text>
              </View>

              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-[#1E293B] text-3xl leading-tight mb-4"
              >
                {course.courseName}
              </Text>

              {/* Teacher Info */}
              <View className="flex-row items-center mb-8 pb-8 border-b border-gray-50">
                <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3 border-2 border-white shadow-sm">
                  <Ionicons name="person" size={20} color="#3B82F6" />
                </View>
                <View>
                  <Text
                    style={{ fontFamily: "Poppins-Medium" }}
                    className="text-gray-400 text-[10px] uppercase tracking-wide"
                  >
                    Giảng viên
                  </Text>
                  <Text
                    style={{ fontFamily: "Poppins-Bold" }}
                    className="text-[#1E293B] text-sm"
                  >
                    {course.teacherName}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <View className="mb-10">
                <View className="bg-blue-100/50 border-l-4 border-blue-600 px-4 py-2 rounded-r-xl mb-4 self-start">
                  <Text
                    style={{ fontFamily: "Poppins-Bold" }}
                    className="text-[#1E293B] text-base"
                  >
                    Mô tả khóa học
                  </Text>
                </View>
                <View className="bg-blue-50/30 p-5 rounded-3xl border border-blue-100/20">
                  <Text
                    style={{ fontFamily: "Poppins-Regular" }}
                    className="text-gray-600 leading-relaxed text-sm"
                  >
                    {course.description ||
                      "Hãy bắt đầu hành trình học tập của bạn ngay hôm nay với khóa học đầy đủ các tài liệu và bài giảng chi tiết nhất."}
                  </Text>
                </View>
              </View>

              {/* Free Trial Section */}
              {firstLesson && !isEnrolled && (
                <View className="mb-10 shadow-xl shadow-orange-100">
                  <TouchableOpacity
                    onPress={() =>
                      router.push(
                        `/student/courses/lessons?courseId=${id}&previewId=${firstLesson.id}` as any,
                      )
                    }
                    activeOpacity={0.8}
                    className="bg-white border border-orange-100 p-6 rounded-[32px] flex-row items-center justify-between"
                  >
                    <View className="flex-1 mr-4">
                      <View className="bg-orange-100 px-3 py-1 rounded-full self-start mb-2">
                        <Text
                          style={{ fontFamily: "Poppins-Bold" }}
                          className="text-orange-600 text-[10px] uppercase"
                        >
                          Học thử miễn phí
                        </Text>
                      </View>
                      <Text
                        style={{ fontFamily: "Poppins-Bold" }}
                        className="text-[#1E293B] text-sm mb-1"
                        numberOfLines={1}
                      >
                        Bắt đầu với: {firstLesson.lessonName}
                      </Text>
                      <Text
                        style={{ fontFamily: "Poppins-Medium" }}
                        className="text-gray-400 text-[10px]"
                      >
                        Xem trước bài giảng đầu tiên để hiểu thêm về khóa học
                      </Text>
                    </View>
                    <View className="bg-orange-500 w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-orange-200">
                      <Ionicons name="play" size={24} color="white" />
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {/* Enrollment Benefit Card */}
              {!isEnrolled && (
                <View className="mb-10 shadow-2xl shadow-blue-100">
                  <View className="bg-blue-600 rounded-[32px] overflow-hidden">
                    <View className="p-7 bg-blue-500/10">
                      <View className="flex-row items-center mb-4">
                        <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3">
                          <Ionicons name="star" size={16} color="white" />
                        </View>
                        <Text
                          style={{ fontFamily: "Poppins-Bold" }}
                          className="text-white text-lg"
                        >
                          Quyền lợi tham gia
                        </Text>
                      </View>

                      <View className="gap-y-3">
                        <View className="flex-row items-center">
                          <Ionicons
                            name="play-circle"
                            size={18}
                            color="#93C5FD"
                          />
                          <Text
                            style={{ fontFamily: "Poppins-Regular" }}
                            className="text-blue-50 text-xs ml-3"
                          >
                            Video bài giảng chất lượng cao
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Ionicons
                            name="document-text"
                            size={18}
                            color="#FCD34D"
                          />
                          <Text
                            style={{ fontFamily: "Poppins-Regular" }}
                            className="text-blue-50 text-xs ml-3"
                          >
                            Tài liệu học tập chi tiết (PDF, Slides)
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Ionicons
                            name="chatbubbles"
                            size={18}
                            color="#6EE7B7"
                          />
                          <Text
                            style={{ fontFamily: "Poppins-Regular" }}
                            className="text-blue-50 text-xs ml-3"
                          >
                            Hỗ trợ 1-1 trực tiếp từ giáo viên
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text
            style={{ fontFamily: "Poppins-Medium" }}
            className="text-gray-500"
          >
            Không tìm thấy khóa học.
          </Text>
        </View>
      )}

      {/* Fixed Bottom Action Button */}
      {course && (
        <View
          className="absolute bottom-0 left-0 right-0 bg-white px-6 pb-8 pt-4 border-t border-gray-100 shadow-2xl"
          style={{ paddingBottom: Math.max(insets.bottom, 24) }}
        >
          <TouchableOpacity
            onPress={handleRegister}
            disabled={isRegistering}
            className={`${isEnrolled ? "bg-green-500" : "bg-blue-600"} py-4 rounded-2xl flex-row items-center justify-center shadow-lg ${isEnrolled ? "shadow-green-100" : "shadow-blue-200"}`}
          >
            {isRegistering ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons
                  name={isEnrolled ? "play-circle" : "card-outline"}
                  size={20}
                  color="white"
                  className="mr-2"
                />
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-white text-base ml-2"
                >
                  {isEnrolled
                    ? "VÀO HỌC NGAY"
                    : `ĐĂNG KÝ - ${course.price === 0 ? "MIỄN PHÍ" : `${course.price.toLocaleString()}đ`}`}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* QR Code Modal for Payment */}
      <Modal
        visible={showQR}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQR(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[40px] px-6 pt-8 pb-10">
            <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-8" />

            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-xl text-[#1E293B]"
                >
                  Thanh toán khóa học
                </Text>
                <Text
                  style={{ fontFamily: "Poppins-Medium" }}
                  className="text-gray-400 text-xs"
                >
                  Mở app Ngân hàng để quét mã VietQR
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowQR(false)}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {paymentInfo && (
              <View className="items-center">
                <View className="p-4 bg-white border-2 border-blue-600 rounded-[32px] shadow-2xl shadow-blue-200">
                  <Image
                    source={{ uri: paymentInfo.qrCodeUrl }}
                    style={{ width: 240, height: 240 }}
                    resizeMode="contain"
                  />
                </View>

                <View className="mt-8 w-full bg-blue-50 rounded-3xl p-5 border border-blue-100">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text
                      style={{ fontFamily: "Poppins-Medium" }}
                      className="text-blue-400 text-xs uppercase tracking-widest"
                    >
                      Nội dung
                    </Text>
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-blue-600 text-sm"
                    >
                      {paymentInfo.orderCode}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text
                      style={{ fontFamily: "Poppins-Medium" }}
                      className="text-blue-400 text-xs uppercase tracking-widest"
                    >
                      Số tiền
                    </Text>
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-[#1E293B] text-lg"
                    >
                      {paymentInfo.amount.toLocaleString()} VNĐ
                    </Text>
                  </View>
                </View>

                <View className="mt-8 items-center flex-row">
                  <ActivityIndicator
                    size="small"
                    color={isSignalRConnected ? "#10B981" : "#3B82F6"}
                    className="mr-3"
                  />
                  <Text
                    style={{ fontFamily: "Poppins-Medium" }}
                    className={isSignalRConnected ? "text-emerald-600 text-sm" : "text-blue-600 text-sm"}
                  >
                    {isSignalRConnected 
                      ? "Đã kết nối trực tiếp - Chờ thanh toán..." 
                      : "Đang chờ bạn thanh toán..."}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
