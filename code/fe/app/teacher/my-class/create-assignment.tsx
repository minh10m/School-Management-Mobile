import { useState } from "react";
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
import { assignmentService } from "../../../services/assignment.service";
import { getErrorMessage } from "../../../utils/error";

export default function CreateAssignmentPage() {
  const { classId, subjectId, subjectName } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [fileUrl, setFileUrl] = useState(""); // Still allow URL if preferred
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [showPicker, setShowPicker] = useState(false);
  const [pickerType, setPickerType] = useState<"start" | "end">("start");

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setFile(result);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chọn tài liệu");
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) return Alert.alert("Lỗi", "Vui lòng nhập tiêu đề");
    if (!endDate) return Alert.alert("Lỗi", "Vui lòng chọn ngày kết thúc");
    if (endDate <= startDate) return Alert.alert("Lỗi", "Ngày kết thúc phải sau ngày bắt đầu");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("Title", title);
      formData.append("Description", description);
      formData.append("StartTime", startDate.toISOString());
      formData.append("FinishTime", endDate.toISOString());
      formData.append("SubjectId", subjectId as string);
      formData.append("ClassYearId", classId as string);

      if (file && !file.canceled && file.assets && file.assets.length > 0) {
        const asset = file.assets[0];
        // Create file object for FormData
        const fileToUpload = {
          uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/octet-stream',
        };
        formData.append("File", fileToUpload as any);
        formData.append("FileTitle", asset.name);
      } else if (fileUrl.trim()) {
        formData.append("FileUrl", fileUrl);
      }

      await assignmentService.createAssignment(formData);
      Alert.alert("Thành công", "Đã giao bài tập mới", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert("Lỗi", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {
      if (pickerType === "start") {
        setStartDate(selectedDate);
      } else {
        // Set to end of day
        const d = new Date(selectedDate);
        d.setHours(23, 59, 59);
        setEndDate(d);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View>
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#1E293B] text-lg">
            Giao bài tập mới
          </Text>
          <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px] uppercase">
            {subjectName}
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
            placeholder="Ví dụ: Bài tập về nhà tuần 12"
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
            Tài liệu đính kèm
          </Text>
          
          <TouchableOpacity
            onPress={handlePickDocument}
            className={`p-6 rounded-[32px] border-2 border-dashed items-center justify-center ${file ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}
          >
            <View className={`w-12 h-12 rounded-full items-center justify-center mb-3 ${file ? 'bg-emerald-500' : 'bg-blue-600'}`}>
              <Ionicons name={file ? "checkmark" : "cloud-upload"} size={24} color="white" />
            </View>
            <Text style={{ fontFamily: "Poppins-Bold" }} className={`text-sm ${file ? 'text-emerald-700' : 'text-blue-600'}`}>
              {file && !file.canceled && file.assets ? file.assets[0].name : "Chọn tài liệu từ máy"}
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

        {/* URL Fallback */}
        {!file && (
          <View className="mb-6">
            <Text style={{ fontFamily: "Poppins-SemiBold" }} className="text-gray-400 text-[10px] uppercase mb-2 ml-1">
              Hoặc nhập Link tài liệu (Google Drive,...)
            </Text>
            <TextInput
              value={fileUrl}
              onChangeText={setFileUrl}
              placeholder="https://..."
              autoCapitalize="none"
              className="bg-gray-50 p-4 rounded-3xl text-[#1E293B] border border-gray-100"
              style={{ fontFamily: "Poppins-Medium" }}
            />
          </View>
        )}

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
          onPress={handleCreate}
          disabled={loading}
          className="bg-blue-600 p-5 rounded-[24px] items-center mb-20 shadow-lg shadow-blue-200"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white text-base">
              Giao bài tập ngay
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
                  minimumDate={new Date()}
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
          minimumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
}
