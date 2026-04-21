import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { courseService } from "../../../services/course.service";
import { teacherService } from "../../../services/teacher.service";
import { TeacherSubject } from "../../../types/teacher";
import { getErrorMessage } from "../../../utils/error";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";

export default function EditCourseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setFetchingData(true);
        // Fetch teacher info and subjects
        const me = await teacherService.getMe();
        const subjects = await teacherService.getTeacherSubjects(me.teacherId);
        setTeacherSubjects(subjects);

        // Fetch course details
        const course = await courseService.getCourseById(id);
        setCourseName(course.courseName);
        setDescription(course.description);
        setPrice(course.price.toString());
        setSelectedSubjectId(course.subjectId || null);
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin khóa học. Vui lòng thử lại.");
        router.back();
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;
    if (!courseName.trim() || !description.trim() || !price || !selectedSubjectId) {
      Alert.alert("Thiếu thông tin", "Vui lòng hoàn thiện tất cả các trường thông tin bắt buộc.");
      return;
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      Alert.alert("Lỗi giá tiền", "Vui lòng nhập số tiền hợp lệ.");
      return;
    }

    try {
      setLoading(true);
      await courseService.updateCourse(id, {
        courseName: courseName.trim(),
        description: description.trim(),
        price: numericPrice,
        subjectId: selectedSubjectId,
      });

      Alert.alert(
        "Thành công",
        "Khóa học của bạn đã được cập nhật.",
        [{ text: "Đồng ý", onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert("Lỗi cập nhật", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const selectedSubject = teacherSubjects.find((s) => s.subjectId === selectedSubjectId);

  return (
    <AdminPageWrapper
      title="Chỉnh sửa khóa học"
      onBack={() => router.back()}
    >
      <StatusBar hidden />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24, paddingBottom: 150 }}
        >
          {fetchingData ? (
            <View className="items-center py-20">
              <ActivityIndicator size="large" color="#136ADA" />
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-4">
                Đang tải dữ liệu...
              </Text>
            </View>
          ) : (
            <View className="gap-y-6">
              {/* SECTION: TÔNG QUAN */}
              <View>
                <View className="flex-row items-center mb-4 ml-1">
                  <View className="w-8 h-8 bg-blue-100 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="information-circle" size={18} color="#136ADA" />
                  </View>
                  <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-base">Thông tin cơ bản</Text>
                </View>

                <View className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm shadow-gray-200">
                  {/* Tên khóa học */}
                  <View className="mb-5">
                    <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-500 text-[11px] uppercase mb-2 ml-1">TÊN KHÓA HỌC</Text>
                    <View className="bg-gray-50/50 border border-gray-100 rounded-2xl px-4 py-3.5 flex-row items-center">
                      <Ionicons name="book-outline" size={18} color="#64748B" className="mr-3" />
                      <TextInput
                        value={courseName}
                        onChangeText={setCourseName}
                        placeholder="VD: Toán học lớp 12 Nâng cao"
                        placeholderTextColor="#94A3B8"
                        className="flex-1 ml-2 text-black text-sm"
                        style={{ fontFamily: "Poppins-Medium" }}
                      />
                    </View>
                  </View>

                  {/* Chọn môn học */}
                  <View>
                    <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-500 text-[11px] uppercase mb-2 ml-1">MÔN HỌC GIẢNG DẠY</Text>
                    <TouchableOpacity
                      onPress={() => setModalVisible(true)}
                      activeOpacity={0.7}
                      className="bg-gray-50/50 border border-gray-100 rounded-2xl px-4 py-3.5 flex-row justify-between items-center"
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="layers-outline" size={18} color="#64748B" className="mr-3" />
                        <Text
                          style={{ fontFamily: "Poppins-Medium" }}
                          className={`ml-2 text-sm ${selectedSubject ? "text-black" : "text-gray-400"}`}
                        >
                          {selectedSubject ? selectedSubject.subjectName : "Chọn môn học của bạn"}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* SECTION: CHI PHÍ */}
              <View>
                <View className="flex-row items-center mb-4 ml-1">
                  <View className="w-8 h-8 bg-orange-100 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="card" size={18} color="#F97316" />
                  </View>
                  <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-base">Học phí & Giá trị</Text>
                </View>

                <View className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm shadow-gray-200">
                  <View>
                    <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-500 text-[11px] uppercase mb-2 ml-1">HỌC PHÍ TOÀN KHÓA</Text>
                    <View className="bg-gray-50/50 border border-gray-100 rounded-2xl px-4 py-3.5 flex-row items-center">
                      <View className="bg-orange-500/10 w-9 h-9 rounded-xl items-center justify-center mr-3">
                        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-orange-600 text-xs">₫</Text>
                      </View>
                      <TextInput
                        value={price}
                        onChangeText={setPrice}
                        placeholder="VD: 500000"
                        keyboardType="numeric"
                        placeholderTextColor="#94A3B8"
                        className="flex-1 text-black text-sm"
                        style={{ fontFamily: "Poppins-Bold" }}
                      />
                      <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-300 text-xs mr-2">VNĐ</Text>
                    </View>
                    <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px] mt-3 ml-1">
                      Lưu ý: Học phí này sẽ được học sinh thanh toán khi đăng ký.
                    </Text>
                  </View>
                </View>
              </View>

              {/* SECTION: CHI TIẾT */}
              <View>
                <View className="flex-row items-center mb-4 ml-1">
                  <View className="w-8 h-8 bg-indigo-100 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="document-text" size={18} color="#4F46E5" />
                  </View>
                  <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-base">Mô tả chi tiết</Text>
                </View>

                <View className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm shadow-gray-200">
                  <View>
                    <View className="flex-row justify-between items-center mb-2 ml-1">
                      <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-500 text-[11px] uppercase">GIỚI THIỆU KHÓA HỌC</Text>
                      <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-300 text-[10px]">{description.length}/500</Text>
                    </View>
                    <TextInput
                      value={description}
                      onChangeText={setDescription}
                      placeholder="Hãy viết điều gì đó thu hút học sinh của bạn..."
                      placeholderTextColor="#94A3B8"
                      multiline
                      numberOfLines={5}
                      maxLength={500}
                      textAlignVertical="top"
                      className="bg-gray-50/50 border border-gray-100 rounded-2xl px-4 py-4 text-black text-sm min-h-[150px]"
                      style={{ fontFamily: "Poppins-Regular" }}
                    />
                  </View>
                </View>
              </View>

              {/* NÚT CẬP NHẬT */}
              <TouchableOpacity
                onPress={handleUpdate}
                disabled={loading}
                activeOpacity={0.8}
                className="mt-4"
              >
                <View className={`h-16 rounded-[24px] flex-row items-center justify-center shadow-xl ${loading ? "bg-gray-300" : "bg-indigo-600 shadow-indigo-200"}`}>
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white text-base mr-2">LƯU THAY ĐỔI</Text>
                      <Ionicons name="save-outline" size={20} color="white" />
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL CHỌN MÔN HỌC */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-end">
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => setModalVisible(false)}
            className="absolute inset-0"
          />
          <View className="bg-white rounded-t-[40px] px-8 pt-8 pb-12 shadow-2xl">
            <View className="w-12 h-1.5 bg-gray-100 rounded-full self-center mb-8" />
            
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-2xl text-black">Chọn môn học</Text>
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-xs">Môn học bạn đang phụ trách giảng dạy</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-gray-50 p-2 rounded-full">
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={teacherSubjects}
              keyExtractor={(item) => item.subjectId}
              showsVerticalScrollIndicator={false}
              className="max-h-[350px]"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedSubjectId(item.subjectId);
                    setModalVisible(false);
                  }}
                  activeOpacity={0.6}
                  className={`mb-3 p-4 rounded-[22px] flex-row items-center justify-between border ${
                    selectedSubjectId === item.subjectId
                      ? "bg-blue-50 border-blue-100"
                      : "bg-gray-50/50 border-gray-100"
                  }`}
                >
                  <View className="flex-row items-center">
                    <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${
                      selectedSubjectId === item.subjectId ? "bg-blue-600" : "bg-white border border-gray-100"
                    }`}>
                      <Ionicons 
                        name="school" 
                        size={18} 
                        color={selectedSubjectId === item.subjectId ? "white" : "#64748B"} 
                      />
                    </View>
                    <Text
                      style={{ fontFamily: selectedSubjectId === item.subjectId ? "Poppins-Bold" : "Poppins-SemiBold" }}
                      className={selectedSubjectId === item.subjectId ? "text-blue-600 text-base" : "text-gray-600 text-sm"}
                    >
                      {item.subjectName}
                    </Text>
                  </View>
                  {selectedSubjectId === item.subjectId && (
                    <Ionicons name="checkmark-circle" size={24} color="#136ADA" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </AdminPageWrapper>
  );
}
