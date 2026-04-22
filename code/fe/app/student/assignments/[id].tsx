import { assignmentService } from "@/services/assignment.service";
import { studentService } from "@/services/student.service";
import { submissionService } from "@/services/submission.service";
import { AssignmentResponse } from "@/types/assignment";
import { SubmissionResponse } from "@/types/submission";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function StudentAssignmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [assignment, setAssignment] = useState<AssignmentResponse | null>(null);
  const [submission, setSubmission] = useState<SubmissionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [fileAsset, setFileAsset] = useState<any>(null);
  const [fileTitle, setFileTitle] = useState("");

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const assignData = await assignmentService.getAssignmentById(id);
      setAssignment(assignData);

      // Fetch current student's profile to get studentId
      const me = await studentService.getMe();

      // Try to fetch existing submission
      try {
        const subData = await submissionService.getMySubmission({
          assignmentId: id,
        });
        setSubmission(subData);
      } catch (err) {
        // If 404, it means no submission yet
        console.log("No submission found for this assignment");
        setSubmission(null);
      }
    } catch (error) {
      console.error("Error fetching assignment detail:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin chi tiết bài tập.");
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

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Validate file size (20MB)
        if (asset.size && asset.size > 20 * 1024 * 1024) {
          Alert.alert("Lỗi", "File quá lớn. Vui lòng chọn file dưới 20MB.");
          return;
        }

        setFileAsset(asset);
        setFileTitle(asset.name);
      }
    } catch (err) {
      console.error("Error picking document:", err);
    }
  };

  const handleSubmit = async () => {
    if (!id) return;
    if (!fileAsset) {
      Alert.alert("Lỗi", "Vui lòng chọn file để nộp.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("AssignmentId", id);
      formData.append("FileTitle", fileTitle || fileAsset.name);

      // On React Native, we need to provide uri, name, and type for the file field
      formData.append("File", {
        uri:
          Platform.OS === "ios"
            ? fileAsset.uri.replace("file://", "")
            : fileAsset.uri,
        name: fileAsset.name,
        type: fileAsset.mimeType || "application/octet-stream",
      } as any);

      await submissionService.submitAssignment(formData);

      Alert.alert("Thành công", "Nộp bài tập thành công!");
      fetchData(); // Refresh to show submission status
    } catch (error: any) {
      console.error("Error submitting assignment:", error);
      const errMsg =
        error.response?.data?.message || "Nộp bài thất bại. Vui lòng thử lại.";
      Alert.alert("Lỗi", errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Stack.Screen options={{ title: "Assignment Details" }} />
        <ActivityIndicator size="large" color="#136ADA" />
        <Text
          className="mt-4 text-gray-400"
          style={{ fontFamily: "Poppins-Regular" }}
        >
          Đang tải chi tiết...
        </Text>
      </View>
    );
  }

  if (!assignment) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text
          className="text-gray-400"
          style={{ fontFamily: "Poppins-Regular" }}
        >
          Không tìm thấy bài tập.
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text
            className="text-bright-blue"
            style={{ fontFamily: "Poppins-Bold" }}
          >
            Quay lại
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isExpired = new Date() > new Date(assignment.finishTime);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Custom Header */}
      <View
        style={{ paddingTop: 60 }}
        className="bg-white px-6 pb-4 flex-row items-center justify-between"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className="text-[#1E293B] text-lg"
        >
          {assignment.subjectName}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Info Card */}
        <View className="px-6 pt-2 pb-6 bg-white">
          <View className="bg-bright-blue p-6 rounded-3xl shadow-lg shadow-blue-200">
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons
                name="book-outline"
                size={16}
                color="rgba(255,255,255,0.7)"
              />
              <Text
                className="text-white/70 text-xs uppercase"
                style={{ fontFamily: "Poppins-Bold" }}
              >
                {assignment.teacherName}
              </Text>
            </View>
            <Text
              className="text-white text-2xl mb-4"
              style={{ fontFamily: "Poppins-Bold" }}
            >
              {assignment.title}
            </Text>

            <View className="h-[1px] bg-white/20 w-full mb-4" />

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="bg-white/20 p-2 rounded-full">
                  <Ionicons name="time-outline" size={14} color="white" />
                </View>
                <View>
                  <Text
                    className="text-white/60 text-[10px]"
                    style={{ fontFamily: "Poppins-Medium" }}
                  >
                    HẠN NỘP
                  </Text>
                  <Text
                    className="text-white text-xs"
                    style={{ fontFamily: "Poppins-Bold" }}
                  >
                    {formatDate(assignment.finishTime)}
                  </Text>
                </View>
              </View>

              <View className="bg-white px-4 py-1.5 rounded-full shadow-sm">
                <Text
                  className="text-bright-blue text-xs"
                  style={{ fontFamily: "Poppins-Bold" }}
                >
                  {submission
                    ? submission.score !== null
                      ? "Đã chấm"
                      : "Đã nộp"
                    : isExpired
                      ? "Quá hạn"
                      : "Đang mở"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description Section */}
        {assignment.description && (
          <View className="px-6 mt-4">
            <Text
              className="text-[#1E293B] text-sm mb-3 ml-1"
              style={{ fontFamily: "Poppins-Bold" }}
            >
              MÔ TẢ BÀI TẬP
            </Text>
            <View className="bg-slate-50 p-5 rounded-[24px] border border-slate-100">
              <Text
                style={{ fontFamily: "Poppins-Regular" }}
                className="text-slate-600 leading-6 text-sm"
              >
                {assignment.description}
              </Text>
            </View>
          </View>
        )}

        {/* Teacher's Attachment Section */}
        {assignment.fileUrl && (
          <View className="px-6 mt-6">
            <Text
              className="text-[#1E293B] text-sm mb-3 ml-1"
              style={{ fontFamily: "Poppins-Bold" }}
            >
              TÀI LIỆU CỦA GIÁO VIÊN
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-row items-center bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm shadow-gray-200"
              onPress={() => {
                if (assignment.fileUrl) {
                  Linking.openURL(assignment.fileUrl);
                }
              }}
            >
              <View className="bg-blue-50 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="document-text" size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-[#1E293B] text-sm"
                  style={{ fontFamily: "Poppins-Bold" }}
                  numberOfLines={2}
                >
                  {assignment.fileTitle || "Tài liệu đính kèm"}
                </Text>
                <Text
                  className="text-gray-400 text-[10px] mt-1"
                  style={{ fontFamily: "Poppins-Medium" }}
                >
                  Nhấn để xem chi tiết đính kèm
                </Text>
              </View>
              <View className="w-10 h-10 items-center justify-center">
                <Ionicons name="download-outline" size={22} color="#94A3B8" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Submission Section */}
        <View className="px-6 mt-8">
          <Text
            className="text-black text-lg mb-2"
            style={{ fontFamily: "Poppins-Bold" }}
          >
            Bài nộp của bạn
          </Text>

          {submission ? (
            <View className="bg-green-50/50 p-5 rounded-2xl border border-green-100">
              <View className="flex-row items-center gap-3 mb-4">
                <View className="bg-green-500/10 w-10 h-10 rounded-lg items-center justify-center">
                  <Ionicons
                    name="checkmark-done-circle"
                    size={24}
                    color="#10B981"
                  />
                </View>
                <View>
                  <Text
                    className="text-black text-sm"
                    style={{ fontFamily: "Poppins-Bold" }}
                  >
                    Đã nộp bài thành công
                  </Text>
                  <Text
                    className="text-gray-400 text-xs"
                    style={{ fontFamily: "Poppins-Regular" }}
                  >
                    Nộp lúc: {formatDate(submission.timeSubmit)}
                  </Text>
                </View>
              </View>

              <View className="bg-white p-4 rounded-xl border border-gray-100 mb-4">
                <View className="flex-row items-center gap-3">
                  <Ionicons name="attach-outline" size={20} color="#6B7280" />
                  <Text
                    className="text-gray-600 text-sm flex-1"
                    style={{ fontFamily: "Poppins-Medium" }}
                  >
                    {submission.fileTitle || "Tệp đã nộp"}
                  </Text>
                </View>
              </View>

              {submission.score !== null && (
                <View className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                  <View className="flex-row justify-between items-center">
                    <Text
                      className="text-black text-sm"
                      style={{ fontFamily: "Poppins-Bold" }}
                    >
                      Điểm của giáo viên
                    </Text>
                    <View className="bg-bright-blue px-4 py-1.5 rounded-full">
                      <Text className="text-white text-sm font-bold">
                        {submission.score} / 10
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
              {isExpired && (
                <View className="flex-row items-center gap-2 mb-4 bg-red-50 p-3 rounded-xl">
                  <Ionicons name="warning-outline" size={16} color="#EF4444" />
                  <Text
                    className="text-red-500 text-xs"
                    style={{ fontFamily: "Poppins-Bold" }}
                  >
                    Lưu ý: Bài tập này đã quá hạn. Bài nộp của bạn sẽ bị đánh
                    dấu là nộp muộn.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                className="border-2 border-dashed border-gray-200 rounded-2xl h-40 items-center justify-center bg-white"
                onPress={handlePickDocument}
              >
                {fileAsset ? (
                  <View className="items-center px-6">
                    <Ionicons
                      name="document-attach"
                      size={40}
                      color="#136ADA"
                    />
                    <Text
                      className="text-black text-sm mt-2 text-center"
                      style={{ fontFamily: "Poppins-Bold" }}
                    >
                      {fileTitle}
                    </Text>
                    <Text
                      className="text-gray-400 text-[10px] mt-1"
                      style={{ fontFamily: "Poppins-Regular" }}
                    >
                      Nhấn để đổi tệp
                    </Text>
                  </View>
                ) : (
                  <View className="items-center">
                    <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mb-2">
                      <Ionicons
                        name="cloud-upload-outline"
                        size={24}
                        color="#136ADA"
                      />
                    </View>
                    <Text
                      className="text-black text-sm"
                      style={{ fontFamily: "Poppins-Bold" }}
                    >
                      Tải lên bài tập
                    </Text>
                    <Text
                      className="text-gray-400 text-xs"
                      style={{ fontFamily: "Poppins-Regular" }}
                    >
                      PDF, Image, Word (Max 20MB)
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <View className="mt-6">
                <Text
                  className="text-gray-400 text-xs mb-2 px-1"
                  style={{ fontFamily: "Poppins-Medium" }}
                >
                  Tiêu đề bài nộp (Tùy chọn)
                </Text>
                <TextInput
                  className="bg-white border border-gray-100 rounded-xl p-4 text-black text-sm"
                  placeholder="Nhập tiêu đề cho bài nộp..."
                  value={fileTitle}
                  onChangeText={setFileTitle}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      {!submission && (
        <View className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 border-t border-gray-100">
          <TouchableOpacity
            className={`w-full py-4 rounded-3xl flex-row items-center justify-center shadow-lg shadow-blue-300 ${submitting ? "bg-blue-300" : "bg-bright-blue"}`}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text
                  className="text-white text-lg mr-2"
                  style={{ fontFamily: "Poppins-Bold" }}
                >
                  {isExpired ? "Nộp muộn" : "Nộp bài tập"}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
