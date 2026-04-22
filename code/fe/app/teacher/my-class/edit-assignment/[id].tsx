import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { assignmentService } from "../../../../services/assignment.service";
import { getErrorMessage } from "../../../../utils/error";

export default function EditAssignmentPage() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [fileTitle, setFileTitle] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [subjectId, setSubjectId] = useState("");
  const [classId, setClassId] = useState("");

  const [showPicker, setShowPicker] = useState(false);
  const [pickerType, setPickerType] = useState<"start" | "end">("start");

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await assignmentService.getAssignmentById(id as string);
      setTitle(data.title);
      setDescription(data.description || "");
      setFileUrl(data.fileUrl || "");
      setFileTitle(data.fileTitle || "");
      setStartDate(new Date(data.startTime));
      setEndDate(new Date(data.finishTime));
      setSubjectId(data.teacherSubjectId); // Wait, backend needs SubjectId (Guid) not TeacherSubjectId? 
      // Actually, looking at AssignmentResponse.cs, it has TeacherSubjectId.
      // But CreateAssignmentPayload needs subjectId.
      // Let's check PostOrUpdateAssignmentRequest.cs again.
      // It has Guid SubjectId.
      // I might need to get the actual SubjectId from the TeacherSubject relation if the backend expects that.
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải chi tiết bài tập");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.size && asset.size > 20 * 1024 * 1024) {
          Alert.alert("Lỗi", "File quá lớn. Vui lòng chọn file dưới 20MB.");
          return;
        }
        setFile(result);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chọn tài liệu");
    }
  };

  const handleUpdate = async () => {
    if (!title.trim()) return Alert.alert("Lỗi", "Vui lòng nhập tiêu đề");
    if (!endDate) return Alert.alert("Lỗi", "Vui lòng chọn ngày kết thúc");
    if (endDate <= startDate) return Alert.alert("Lỗi", "Ngày kết thúc phải sau ngày áp dụng");

    try {
      setUpdating(true);
      const formData = new FormData();
      formData.append("Title", title);
      formData.append("Description", description);
      formData.append("StartTime", startDate.toISOString());
      formData.append("FinishTime", endDate.toISOString());
      
      // Note: Backend UpdateAssignment requires SubjectId and ClassYearId
      // We should use the ones from the fetched data
      // I'll need to make sure I have the right IDs.
      
      // Re-fetching or getting from initial data
      const detail = await assignmentService.getAssignmentById(id as string);
      formData.append("SubjectId", detail.subjectId);
      formData.append("ClassYearId", detail.classYearId);

      if (file && !file.canceled && file.assets && file.assets.length > 0) {
        const asset = file.assets[0];
        const fileToUpload = {
          uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/octet-stream',
        };
        formData.append("File", fileToUpload as any);
        formData.append("FileTitle", asset.name);
      } else {
        formData.append("FileTitle", fileTitle);
        // If no new file, backend keeps the old one usually, but we need to check
      }

      await assignmentService.updateAssignment(id as string, formData);
      Alert.alert("Thành công", "Đã cập nhật bài tập", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert("Lỗi", getErrorMessage(error));
    } finally {
      setUpdating(false);
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {
      if (pickerType === "start") {
        setStartDate(selectedDate);
      } else {
        const d = new Date(selectedDate);
        d.setHours(23, 59, 59);
        setEndDate(d);
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#136ADA" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View>
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#1E293B] text-lg">
            Chỉnh sửa bài tập
          </Text>
          <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px] uppercase">
            Cập nhật nội dung & thời hạn
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <View className="mb-6">
          <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-400 text-[10px] uppercase mb-2 ml-1">
            Tiêu đề bài tập
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Tiêu đề bài tập"
            className="bg-gray-50 p-4 rounded-3xl text-[#1E293B] border border-gray-100"
            style={{ fontFamily: "Poppins-Medium" }}
          />
        </View>

        {/* Description Input */}
        <View className="mb-6">
          <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-400 text-[10px] uppercase mb-2 ml-1">
            Mô tả / Yêu cầu chi tiết
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Hướng dẫn học sinh làm bài..."
            multiline
            numberOfLines={4}
            className="bg-gray-50 p-4 rounded-3xl text-[#1E293B] border border-gray-100 min-h-[120px]"
            textAlignVertical="top"
            style={{ fontFamily: "Poppins-Medium" }}
          />
        </View>

        {/* File Upload Section */}
        <View className="mb-6">
          <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-400 text-[10px] uppercase mb-2 ml-1">
            Thay đổi tài liệu đính kèm
          </Text>
          
          <TouchableOpacity
            onPress={handlePickDocument}
            className={`p-6 rounded-[32px] border-2 border-dashed items-center justify-center ${file ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}
          >
            <View className={`w-12 h-12 rounded-full items-center justify-center mb-3 ${file ? 'bg-emerald-500' : 'bg-blue-600'}`}>
              <Ionicons name={file ? "checkmark" : "cloud-upload"} size={24} color="white" />
            </View>
            <Text style={{ fontFamily: "Poppins-Bold" }} className={`text-sm ${file ? 'text-emerald-700' : 'text-blue-600'}`}>
              {file && !file.canceled && file.assets ? file.assets[0].name : (fileTitle || "Chọn tài liệu mới")}
            </Text>
            <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px] mt-1">
              Hỗ trợ PDF, DOCX, Hình ảnh...
            </Text>
          </TouchableOpacity>

          {file && (
            <TouchableOpacity onPress={() => setFile(null)} className="mt-3 self-center">
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-rose-500 text-xs">Xóa tài liệu đã chọn</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Date Inputs */}
        <View className="flex-row gap-4 mb-10">
          <View className="flex-1">
            <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-400 text-[10px] uppercase mb-2 ml-1">
              Ngày áp dụng
            </Text>
            <TouchableOpacity
              onPress={() => {
                setPickerType("start");
                setShowPicker(true);
              }}
              className="bg-gray-50 p-4 rounded-2xl flex-row justify-between items-center border border-gray-100"
            >
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#1E293B] text-xs">
                {startDate.toLocaleDateString("vi-VN")}
              </Text>
              <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <View className="flex-1">
            <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-400 text-[10px] uppercase mb-2 ml-1">
              Hạn nộp bài
            </Text>
            <TouchableOpacity
              onPress={() => {
                setPickerType("end");
                setShowPicker(true);
              }}
              className="bg-gray-50 p-4 rounded-2xl flex-row justify-between items-center border border-gray-100"
            >
              <Text style={{ fontFamily: "Poppins-Bold" }} className={`text-xs ${endDate ? "text-[#1E293B]" : "text-gray-400"}`}>
                {endDate ? endDate.toLocaleDateString("vi-VN") : "Chọn ngày"}
              </Text>
              <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleUpdate}
          disabled={updating}
          className="bg-blue-600 p-5 rounded-[24px] items-center mb-20 shadow-lg shadow-blue-200"
        >
          {updating ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white text-base">
              Lưu thay đổi
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Date Picker Modal for iOS */}
      {Platform.OS === "ios" && (
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPicker(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => setShowPicker(false)}
            className="flex-1 bg-black/40 justify-center items-center px-6"
          >
            <View className="bg-white rounded-[32px] w-full p-6 shadow-2xl">
              <View className="flex-row justify-between items-center mb-6">
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-lg">
                  {pickerType === "start" ? "Chọn ngày bắt đầu" : "Chọn hạn nộp"}
                </Text>
                <TouchableOpacity 
                  onPress={() => setShowPicker(false)}
                  className="bg-blue-50 px-4 py-2 rounded-xl"
                >
                  <Text style={{ fontFamily: "Poppins-Bold" }} className="text-blue-600 text-xs">Xong</Text>
                </TouchableOpacity>
              </View>
              
              <View className="items-center justify-center">
                <DateTimePicker
                  value={pickerType === "start" ? startDate : (endDate || new Date())}
                  mode="date"
                  display="spinner"
                  locale="vi-VN"
                  onChange={onChangeDate}
                  style={{ width: '100%', height: 200 }}
                  textColor="black"
                />
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Android Date Picker */}
      {Platform.OS === "android" && showPicker && (
        <DateTimePicker
          value={pickerType === "start" ? startDate : (endDate || new Date())}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}
    </SafeAreaView>
  );
}
