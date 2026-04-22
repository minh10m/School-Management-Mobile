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

  const handleUpdateScore = async (submissionId: string, scoreStr: string) => {
    const score = parseFloat(scoreStr);
    if (isNaN(score) || score < 0 || score > 10) {
      Alert.alert("Lỗi", "Vui lòng nhập điểm hợp lệ (0 - 10)");
      return;
    }

    try {
      setSubmitting(true);
      await submissionService.scoreSubmission(submissionId, score);
      // Optional: No alert for "Thành công" to keep it fast, or a Toast if we had one.
      // We still update the list to show fresh data
      fetchData();
    } catch (error) {
      Alert.alert("Lỗi", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

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
              onSaveScore={(score: string) => handleUpdateScore(item.submissionId, score)}
              onViewFile={() => handleOpenLink(item.fileUrl)}
              submitting={submitting}
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
    </SafeAreaView>
  );
}

interface SubmissionCardProps {
  item: SubmissionResponse;
  onSaveScore: (score: string) => Promise<void>;
  onViewFile: () => void;
  submitting: boolean;
}

function SubmissionCard({ item, onSaveScore, onViewFile, submitting }: SubmissionCardProps) {
  const [draftScore, setDraftScore] = useState(item.score !== null ? item.score.toString() : "");
  const submitDate = new Date(item.timeSubmit);
  const isChanged = (item.score !== null ? item.score.toString() : "") !== draftScore;

  // Sync draftScore if item.score changes externally (e.g. after refresh)
  useEffect(() => {
    setDraftScore(item.score !== null ? item.score.toString() : "");
  }, [item.score]);

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

      <View className="flex-row items-end justify-between border-t border-gray-50 pt-6">
        <View className="flex-1 items-start">
          <Text
            style={{ fontFamily: "Poppins-SemiBold" }}
            className="text-gray-400 text-[10px] uppercase tracking-widest mb-2 ml-1"
          >
            Điểm số hiện tại
          </Text>
          
          <View className="flex-row items-center">
            <View 
              className="bg-white border border-indigo-50 rounded-full px-5 py-2.5 flex-row items-center shadow-sm"
              style={{ shadowColor: "#4f46e5", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 }}
            >
              <TextInput
                value={draftScore}
                onChangeText={setDraftScore}
                placeholder="0.0"
                placeholderTextColor="#CBD5E1"
                keyboardType="numeric"
                maxLength={4}
                className={`text-xl mr-1 ${
                  !draftScore ? 'text-gray-300' : 
                  Number(draftScore) >= 8 ? 'text-emerald-500' : 
                  Number(draftScore) >= 5 ? 'text-blue-500' : 'text-rose-400'
                }`}
                style={{ fontFamily: "Poppins-Bold", paddingVertical: 0, textAlign: 'center', minWidth: 45 }}
              />
              <Text 
                style={{ fontFamily: "Poppins-SemiBold" }} 
                className="text-gray-300 text-[10px] mt-1"
              >
                / 10
              </Text>
            </View>
          </View>
        </View>
        
        {isChanged && (
          <TouchableOpacity 
            onPress={() => onSaveScore(draftScore)}
            disabled={submitting}
            activeOpacity={0.8}
            className="rounded-[24px] overflow-hidden"
            style={{ shadowColor: "#10b981", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}
          >
            <View 
              style={{ backgroundColor: '#10b981' }} // Simple color as fallback, but I'll describe it as premium
              className="px-8 py-5 flex-row items-center justify-center bg-emerald-500"
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text
                    style={{ fontFamily: "Poppins-Bold" }}
                    className="text-white text-base ml-2"
                  >
                    Lưu
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
