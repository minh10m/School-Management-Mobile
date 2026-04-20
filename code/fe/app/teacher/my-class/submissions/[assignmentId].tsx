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
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { submissionService } from "../../../../services/submission.service";
import { SubmissionResponse } from "../../../../types/submission";
import { getErrorMessage } from "../../../../utils/error";

export default function AssignmentSubmissions() {
  const { assignmentId, title } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([]);
  
  // Grading Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionResponse | null>(null);
  const [scoreValue, setScoreValue] = useState("");

  const fetchData = useCallback(async () => {
    if (!assignmentId) return;
    try {
      setLoading(true);
      const data = await submissionService.getSubmissions({ 
        AssignmentId: assignmentId as string,
        PageSize: 100 
      });
      setSubmissions(data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách bài nộp");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Lỗi", "Không thể mở liên kết này");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Đã có lỗi xảy ra khi mở liên kết");
    }
  };

  const handleScoreSubmit = async () => {
    if (!selectedSubmission) return;
    const score = parseFloat(scoreValue);
    if (isNaN(score) || score < 0 || score > 10) {
      Alert.alert("Lỗi", "Vui lòng nhập điểm hợp lệ (0 - 10)");
      return;
    }

    try {
      setSubmitting(true);
      await submissionService.scoreSubmission(selectedSubmission.submissionId, score);
      Alert.alert("Thành công", "Đã chấm điểm bài nộp");
      setModalVisible(false);
      fetchData();
    } catch (error) {
      Alert.alert("Lỗi", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const openGradingModal = (submission: SubmissionResponse) => {
    setSelectedSubmission(submission);
    setScoreValue(submission.score !== null ? submission.score.toString() : "");
    setModalVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
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
            numberOfLines={1}
          >
            Quản lý bài nộp
          </Text>
          <Text
            style={{ fontFamily: "Poppins-Medium" }}
            className="text-gray-400 text-[10px] uppercase"
          >
            {title}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6 pt-6"
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
        ) : (Array.isArray(submissions) && submissions.length > 0) ? (
          submissions.map((item) => (
            <SubmissionCard 
              key={item.submissionId} 
              item={item} 
              onScore={() => openGradingModal(item)}
              onViewFile={() => handleOpenLink(item.fileUrl)}
            />
          ))
        ) : (
          <View className="py-20 items-center">
            <Ionicons name="cloud-upload-outline" size={64} color="#E5E7EB" />
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-400 mt-4"
            >
              Chưa có học sinh nào nộp bài
            </Text>
          </View>
        )}
        <View className="h-10" />
      </ScrollView>

      {/* Grading Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[40px] p-8">
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-xl">
                  Chấm điểm bài nộp
                </Text>
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-xs">
                  Học sinh: {selectedSubmission?.studentName}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View className="mb-10">
              <Text
                style={{ fontFamily: "Poppins-SemiBold" }}
                className="text-gray-400 text-[10px] uppercase mb-3 ml-1"
              >
                Nhập điểm (Thang điểm 10)
              </Text>
              <TextInput
                value={scoreValue}
                onChangeText={setScoreValue}
                placeholder="VD: 8.5"
                keyboardType="numeric"
                className="bg-gray-50 p-5 rounded-[24px] text-gray-800 text-2xl text-center"
                style={{ fontFamily: "Poppins-Bold" }}
                autoFocus
              />
            </View>

            <TouchableOpacity
              onPress={handleScoreSubmit}
              disabled={submitting}
              className="bg-blue-600 py-5 rounded-[24px] items-center shadow-lg shadow-blue-200"
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-white text-base"
                >
                  Xác nhận chấm điểm
                </Text>
              )}
            </TouchableOpacity>
            <View className="h-6" />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SubmissionCard({ item, onScore, onViewFile }: any) {
  const submitDate = new Date(item.timeSubmit);

  return (
    <View className="bg-white border border-gray-100 rounded-[32px] p-6 mb-5 shadow-sm">
      <View className="flex-row justify-between items-start mb-5">
        <View className="flex-1 mr-4">
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-gray-900 text-base"
            numberOfLines={1}
          >
            {item.studentName}
          </Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="time-outline" size={12} color="#94A3B8" />
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-400 text-[10px] ml-1"
            >
              Nộp lúc: {submitDate.toLocaleDateString("vi-VN")} {submitDate.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
        <View className={`px-3 py-1.5 rounded-xl ${item.score !== null ? 'bg-emerald-50' : 'bg-amber-50'}`}>
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className={`text-[9px] uppercase ${item.score !== null ? 'text-emerald-600' : 'text-amber-600'}`}
          >
            {item.score !== null ? 'Đã chấm' : 'Chưa chấm'}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        onPress={onViewFile}
        className="flex-row items-center bg-gray-50/80 p-4 rounded-2xl border border-gray-100 mb-6"
      >
        <Ionicons name="document-attach-outline" size={20} color="#1D4ED8" />
        <Text
          style={{ fontFamily: "Poppins-SemiBold" }}
          className="text-gray-700 text-xs ml-3 flex-1"
          numberOfLines={1}
        >
          {item.fileTitle || "Xem bài nộp chi tiết"}
        </Text>
        <Ionicons name="open-outline" size={16} color="#94A3B8" />
      </TouchableOpacity>

      <View className="flex-row items-center justify-between border-t border-gray-50 pt-5">
        <View>
          <Text
            style={{ fontFamily: "Poppins-Medium" }}
            className="text-gray-400 text-[10px] uppercase mb-1"
          >
            Điểm số
          </Text>
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className={`text-xl ${item.score !== null ? 'text-blue-600' : 'text-gray-300'}`}
          >
            {item.score !== null ? item.score.toFixed(1) : "---"}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={onScore}
          className="bg-blue-600 px-6 py-3 rounded-2xl shadow-md shadow-blue-100"
        >
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-white text-xs"
          >
            {item.score !== null ? "Sửa điểm" : "Chấm điểm"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
