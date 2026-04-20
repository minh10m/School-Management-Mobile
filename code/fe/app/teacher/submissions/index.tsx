import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useCallback } from "react";
import { submissionService } from "../../../services/submission.service";
import { TeacherSubmissionListResponse } from "../../../types/submission";

export default function TeacherSubmissions() {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  const [submissions, setSubmissions] = useState<TeacherSubmissionListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    if (!assignmentId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await submissionService.getSubmissionsByAssignment({
        assignmentId,
      });
      setSubmissions(data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSubmissions();
  }, [fetchSubmissions]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar hidden />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-black text-lg">
          Danh sách bài nộp
        </Text>
        <View className="w-10" />
      </View>

      {!assignmentId ? (
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="information-circle-outline" size={64} color="#D1D5DB" />
          <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-4 text-center">
            Vui lòng chọn bài tập để xem danh sách bài nộp.
          </Text>
        </View>
      ) : (
        <FlatList
          data={submissions}
          keyExtractor={(item) => item.submissionId}
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-4"
              onPress={() => {
                // Navigate to submission detail for grading
                router.push(`/teacher/submissions/${item.submissionId}` as any);
              }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center">
                    <Text style={{ fontFamily: "Poppins-Bold" }} className="text-indigo-600 text-sm">
                      {item.studentName.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontFamily: "Poppins-Bold" }} className="text-black text-sm">
                      {item.studentName}
                    </Text>
                    <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-400 text-[10px]">
                      {new Date(item.timeSubmit).toLocaleString('vi-VN')}
                    </Text>
                  </View>
                </View>
                <View className={`${item.score !== null ? 'bg-green-100' : 'bg-orange-100'} px-3 py-1 rounded-full`}>
                   <Text style={{ fontFamily: "Poppins-Bold" }} className={`${item.score !== null ? 'text-green-600' : 'text-orange-600'} text-[10px] uppercase`}>
                      {item.score !== null ? `Điểm: ${item.score}` : "Chờ chấm"}
                   </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-gray-50">
                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="attach-outline" size={14} color="#6B7280" />
                  <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-xs">
                    Có file đính kèm
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                    <Text style={{ fontFamily: "Poppins-Bold" }} className="text-blue-500 text-xs">
                       {item.score !== null ? "Xem lại" : "Chấm ngay"}
                    </Text>
                   <Ionicons name="chevron-forward" size={14} color="#3B82F6" />
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            loading && !refreshing ? (
              <View className="items-center py-20">
                <ActivityIndicator size="large" color="#136ADA" />
              </View>
            ) : (
              <View className="items-center py-20">
                <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
                 <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-4 text-center">
                  Chưa có bài nộp nào cho bài tập này.
                </Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}
