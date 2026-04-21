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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { courseService } from "../../../services/course.service";
import { teacherService } from "../../../services/teacher.service";
import { TeacherSubject } from "../../../types/teacher";
import { getErrorMessage } from "../../../utils/error";

export default function CreateCourseScreen() {
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null,
  );

  const [loading, setLoading] = useState(false);
  const [fetchingSubjects, setFetchingSubjects] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const me = await teacherService.getMe();
        const subjects = await teacherService.getTeacherSubjects(me.teacherId);
        setTeacherSubjects(subjects);
        if (subjects.length > 0) {
          setSelectedSubjectId(subjects[0].subjectId);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
        Alert.alert(
          "Lỗi",
          "Không thể tải danh sách môn học. Vui lòng thử lại.",
        );
      } finally {
        setFetchingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleCreate = async () => {
    if (
      !courseName.trim() ||
      !description.trim() ||
      !price ||
      !selectedSubjectId
    ) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      Alert.alert("Lỗi", "Vui lòng nhập giá khóa học hợp lệ.");
      return;
    }

    try {
      setLoading(true);
      await courseService.createCourse({
        courseName: courseName.trim(),
        description: description.trim(),
        price: numericPrice,
        subjectId: selectedSubjectId,
      });

      Alert.alert(
        "Thành công",
        "Tạo khóa học thành công (Đang chờ phê duyệt)",
        [{ text: "Đồng ý", onPress: () => router.back() }],
      );
    } catch (error: any) {
      console.error("Error creating course:", error);
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const selectedSubject = teacherSubjects.find(
    (s) => s.subjectId === selectedSubjectId,
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar hidden />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className="text-black text-lg"
        >
          Tạo khóa học mới
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-6 py-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {fetchingSubjects ? (
          <View className="items-center py-20">
            <ActivityIndicator size="large" color="#136ADA" />
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-400 mt-4 text-center"
            >
              Đang tải danh sách môn học...
            </Text>
          </View>
        ) : (
          <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            {/* Input: Course Name */}
            <View className="mb-4">
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-700 text-sm mb-1.5 ml-1"
              >
                Tên khóa học <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={courseName}
                onChangeText={setCourseName}
                placeholder="VD: Giải tích nâng cao..."
                placeholderTextColor="#9ca3af"
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-black text-sm"
                style={{ fontFamily: "Poppins-Regular" }}
              />
            </View>

            {/* Input: Subject Selection */}
            <View className="mb-4">
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-700 text-sm mb-1.5 ml-1"
              >
                Môn học <Text className="text-red-500">*</Text>
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 flex-row justify-between items-center"
              >
                <Text
                  style={{ fontFamily: "Poppins-Regular" }}
                  className={
                    selectedSubject
                      ? "text-black text-sm"
                      : "text-gray-400 text-sm"
                  }
                >
                  {selectedSubject
                    ? selectedSubject.subjectName
                    : "Chọn môn học..."}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Input: Price */}
            <View className="mb-4">
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-700 text-sm mb-1.5 ml-1"
              >
                Học phí (VNĐ) <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="VD: 500000"
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-black text-sm"
                style={{ fontFamily: "Poppins-Regular" }}
              />
            </View>

            {/* Input: Description */}
            <View className="mb-6">
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-700 text-sm mb-1.5 ml-1"
              >
                Mô tả <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Nhập chi tiết về nội dung khóa học..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-black text-sm min-h-[120px]"
                style={{ fontFamily: "Poppins-Regular" }}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleCreate}
              disabled={loading}
              className={`rounded-2xl py-4 items-center flex-row justify-center ${
                loading ? "bg-blue-300" : "bg-blue-600"
              }`}
              style={{
                shadowColor: "#2563EB",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="white"
                    className="mr-2"
                  />
                  <Text
                    style={{ fontFamily: "Poppins-Bold" }}
                    className="text-white text-base ml-2"
                  >
                    Tạo khóa học
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Subject Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 min-h-[50%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-xl text-black"
              >
                Chọn môn học
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons
                  name="close-circle-outline"
                  size={28}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
            <FlatList
              data={teacherSubjects}
              keyExtractor={(item) => item.subjectId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedSubjectId(item.subjectId);
                    setModalVisible(false);
                  }}
                  className={`py-4 border-b border-gray-100 flex-row justify-between items-center ${
                    selectedSubjectId === item.subjectId
                      ? "bg-blue-50/50 px-2 rounded-xl border-b-0"
                      : ""
                  }`}
                >
                  <Text
                    style={{
                      fontFamily:
                        selectedSubjectId === item.subjectId
                          ? "Poppins-Bold"
                          : "Poppins-Regular",
                    }}
                    className={
                      selectedSubjectId === item.subjectId
                        ? "text-blue-600"
                        : "text-black"
                    }
                  >
                    {item.subjectName}
                  </Text>
                  {selectedSubjectId === item.subjectId && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#2563EB"
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
