import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { assignmentService } from "../../../services/assignment.service";
import { TeacherAssignmentListResponse } from "../../../types/assignment";
import { SCHOOL_YEAR, TERM } from "../../../constants/config";
import { getErrorMessage } from "../../../utils/error";

export default function ClassAssignments() {
  const { classId, subjectId, subjectName } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assignments, setAssignments] = useState<
    TeacherAssignmentListResponse[]
  >([]);

  // Modal state for creating assignment
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newFileUrl, setNewFileUrl] = useState("");
  const [newFileTitle, setNewFileTitle] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [finishDate, setFinishDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerType, setPickerType] = useState<"start" | "finish">("start");
  const [tempDate, setTempDate] = useState(new Date());

  const setFinishDateToEndOfDay = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 0, 0);
    setFinishDate(newDate);
  };

  const fetchData = useCallback(async () => {
    if (!classId) return;
    try {
      setLoading(true);
      const params: any = { ClassYearId: classId as string };
      if (subjectId) params.SubjectId = subjectId as string;
      const data = await assignmentService.getAssignments(params);
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [classId, subjectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const normalizeUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const handleCreateAssignment = async () => {
    if (!newTitle.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tiêu đề bài tập");
      return;
    }
    if (!subjectId || subjectId === "") {
      Alert.alert(
        "Lỗi",
        "Không tìm thấy môn học. Vui lòng quay lại và chọn lớp học lại.",
      );
      return;
    }
    if (!finishDate) {
      Alert.alert("Lỗi", "Vui lòng chọn ngày kết thúc cho bài tập.");
      return;
    }
    if (finishDate <= startDate) {
      Alert.alert("Lỗi", "Ngày kết thúc phải sau ngày áp dụng.");
      return;
    }

    try {
      setLoading(true);
      console.log("[Assignment Create] Payload:", {
        classYearId: classId,
        subjectId: subjectId,
        title: newTitle,
      });
      await assignmentService.createAssignment({
        title: newTitle,
        description: newDesc,
        fileUrl: normalizeUrl(newFileUrl),
        fileTitle: newFileTitle,
        classYearId: classId as string,
        subjectId: subjectId as string,
        startTime: startDate.toISOString(),
        finishTime: finishDate.toISOString(),
      });

      Alert.alert("Thành công", "Đã tạo bài tập mới");
      setModalVisible(false);
      setNewTitle("");
      setNewDesc("");
      setNewFileUrl("");
      setNewFileTitle("");
      setFinishDate(null);
      setStartDate(new Date());
      fetchData();
    } catch (error) {
      console.error("Error creating assignment:", error);
      Alert.alert("Lỗi", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa bài tập này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await assignmentService.deleteAssignment(id);
            fetchData();
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa bài tập");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar hidden />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-black text-lg"
          >
            Bài tập lớp học
          </Text>
          <Text
            style={{ fontFamily: "Poppins-Medium" }}
            className="text-gray-400 text-[10px] uppercase"
          >
            {subjectName}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="bg-blue-600 w-10 h-10 rounded-2xl items-center justify-center shadow-md shadow-blue-200"
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#136ADA"
          />
        }
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#136ADA" className="mt-20" />
        ) : assignments.length === 0 ? (
          <View className="py-20 items-center">
            <Ionicons name="document-text-outline" size={64} color="#E5E7EB" />
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-400 mt-4"
            >
              Chưa có bài tập nào được giao
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="mt-6 border border-blue-600 px-6 py-2 rounded-2xl"
            >
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-blue-600 text-xs"
              >
                Tạo bài tập đầu tiên
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          assignments.map((item) => (
            <AssignmentRow
              key={item.assignmentId}
              item={item}
              onDelete={() => handleDelete(item.assignmentId)}
            />
          ))
        )}
      </ScrollView>

      {/* Create Assignment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[40px] p-8">
            <View className="flex-row justify-between items-center mb-6">
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-xl">
                Giao bài tập mới
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text
                style={{ fontFamily: "Poppins-SemiBold" }}
                className="text-gray-400 text-[10px] uppercase mb-2 ml-1"
              >
                Tiêu đề
              </Text>
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="Ví dụ: Bài tập ôn tập chương 1"
                className="bg-gray-50 p-4 rounded-2xl text-gray-800"
                style={{ fontFamily: "Poppins-Medium" }}
              />
            </View>

            <View className="mb-8">
              <Text
                style={{ fontFamily: "Poppins-SemiBold" }}
                className="text-gray-400 text-[10px] uppercase mb-2 ml-1"
              >
                Mô tả / Yêu cầu
              </Text>
              <TextInput
                value={newDesc}
                onChangeText={setNewDesc}
                placeholder="Nội dung chi tiết..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="bg-gray-50 p-4 rounded-2xl text-gray-800 min-h-[100px]"
                style={{ fontFamily: "Poppins-Medium" }}
              />
            </View>

            <View className="mb-6">
              <Text
                style={{ fontFamily: "Poppins-SemiBold" }}
                className="text-gray-400 text-[10px] uppercase mb-2 ml-1"
              >
                Tên tài liệu đính kèm
              </Text>
              <TextInput
                value={newFileTitle}
                onChangeText={setNewFileTitle}
                placeholder="VD: Tài liệu hướng dẫn ôn tập.pdf"
                className="bg-gray-50 p-4 rounded-2xl text-gray-800"
                style={{ fontFamily: "Poppins-Medium" }}
              />
            </View>

            <View className="mb-8">
              <Text
                style={{ fontFamily: "Poppins-SemiBold" }}
                className="text-gray-400 text-[10px] uppercase mb-2 ml-1"
              >
                URL tài liệu (Link)
              </Text>
              <TextInput
                value={newFileUrl}
                onChangeText={setNewFileUrl}
                placeholder="https://..."
                autoCapitalize="none"
                className="bg-gray-50 p-4 rounded-2xl text-gray-800"
                style={{ fontFamily: "Poppins-Medium" }}
              />
            </View>

            <View className="flex-row gap-4 mb-8">
              <View className="flex-1">
                <Text
                  style={{ fontFamily: "Poppins-SemiBold" }}
                  className="text-gray-400 text-[10px] uppercase mb-2 ml-1"
                >
                  Ngày áp dụng
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setPickerType("start");
                    setTempDate(startDate);
                    setShowDatePicker(true);
                  }}
                  className="bg-gray-50 p-4 rounded-2xl flex-row justify-between items-center"
                >
                  <Text
                    style={{ fontFamily: "Poppins-Medium" }}
                    className="text-gray-800 text-[10px]"
                  >
                    {startDate.toLocaleDateString("vi-VN")}
                  </Text>
                  <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <View className="flex-1">
                <Text
                  style={{ fontFamily: "Poppins-SemiBold" }}
                  className="text-gray-400 text-[10px] uppercase mb-2 ml-1"
                >
                  Ngày kết thúc
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setPickerType("finish");
                    setTempDate(finishDate || new Date());
                    setShowDatePicker(true);
                  }}
                  className="bg-gray-50 p-4 rounded-2xl flex-row justify-between items-center"
                >
                  <Text
                    style={{ fontFamily: "Poppins-Medium" }}
                    className={finishDate ? "text-gray-800 text-[10px]" : "text-gray-400 text-[10px]"}
                  >
                    {finishDate ? finishDate.toLocaleDateString("vi-VN") : "Chọn ngày"}
                  </Text>
                  <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleCreateAssignment}
              disabled={loading}
              className="bg-blue-600 py-4 rounded-2xl items-center shadow-lg shadow-blue-200"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-white text-base"
                >
                  Giao bài tập
                </Text>
              )}
            </TouchableOpacity>

            {/* iOS Date Picker Modal */}
            {Platform.OS === "ios" && (
              <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDatePicker(false)}
              >
                <TouchableOpacity 
                  activeOpacity={1} 
                  onPress={() => setShowDatePicker(false)}
                  className="flex-1 bg-black/40 justify-end"
                >
                  <TouchableOpacity 
                    activeOpacity={1} 
                    className="bg-white rounded-t-[40px] p-6 pb-12"
                  >
                    <View className="flex-row justify-between items-center mb-6">
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500">Hủy</Text>
                      </TouchableOpacity>
                      <Text style={{ fontFamily: "Poppins-Bold" }} className="text-lg">Chọn ngày</Text>
                      <TouchableOpacity onPress={() => {
                        if (pickerType === "start") {
                          setStartDate(tempDate);
                        } else {
                          setFinishDateToEndOfDay(tempDate);
                        }
                        setShowDatePicker(false);
                      }}>
                        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-blue-600">Xong</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <DateTimePicker
                      value={tempDate}
                      mode="date"
                      display="spinner"
                      locale="vi-VN"
                      onChange={(event, date) => {
                        if (date) setTempDate(date);
                      }}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              </Modal>
            )}

            {/* Android Date Picker */}
            {Platform.OS === "android" && showDatePicker && (
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (event.type === "set" && date) {
                    if (pickerType === "start") {
                      setStartDate(date);
                    } else {
                      setFinishDateToEndOfDay(date);
                    }
                  }
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function AssignmentRow({ item, onDelete }: any) {
  const endDate = new Date(item.finishTime);
  const now = new Date();
  const isExpired = endDate < now;

  return (
    <View className="bg-white border border-gray-100 rounded-3xl p-5 mb-4 shadow-sm">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-4">
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-gray-800 text-base"
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {item.description && (
            <Text
              style={{ fontFamily: "Poppins-Regular" }}
              className="text-gray-400 text-xs mt-1"
              numberOfLines={2}
            >
              {item.description}
            </Text>
          )}
          {item.fileUrl && (
            <View className="flex-row items-center mt-3 bg-blue-50/50 self-start px-3 py-1.5 rounded-lg border border-blue-100/50">
              <Ionicons name="document-attach-outline" size={12} color="#1D4ED8" />
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-[#1D4ED8] text-[9px] ml-1.5"
                numberOfLines={1}
              >
                {item.fileTitle || "Tài liệu đính kèm"}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={onDelete}
          className="bg-rose-50 w-8 h-8 rounded-full items-center justify-center"
        >
          <Ionicons name="trash-outline" size={16} color="#E11D48" />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-between pt-4 border-t border-gray-50">
        <View className="flex-row items-center">
          <Ionicons
            name="time-outline"
            size={14}
            color={isExpired ? "#E11D48" : "#94A3B8"}
          />
          <Text
            style={{ fontFamily: "Poppins-Medium" }}
            className={`text-[10px] ml-1 ${isExpired ? "text-rose-500" : "text-gray-400"}`}
          >
            Hết hạn: {endDate.toLocaleDateString("vi-VN")}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push({
            pathname: "/teacher/my-class/submissions/[assignmentId]",
            params: { 
              assignmentId: item.assignmentId,
              title: item.title
            }
          })}
          className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100/50 flex-row items-center"
        >
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-blue-600 text-[10px] mr-1"
          >
            {item.submissionCount || 0} nộp
          </Text>
          <Ionicons name="chevron-forward" size={10} color="#2563EB" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
