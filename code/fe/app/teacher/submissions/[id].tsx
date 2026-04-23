import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { submissionService } from "../../../services/submission.service";
import { SubmissionResponse } from "../../../types/submission";
import { studentService } from "../../../services/student.service";
import { StudentResponse } from "../../../types/student";

export default function GradeSubmissionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [submission, setSubmission] = useState<SubmissionResponse | null>(null);
  const [student, setStudent] = useState<StudentResponse | null>(null);
  
  const [score, setScore] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const subData = await submissionService.getSubmissionById(id);
      setSubmission(subData);
      
      if (subData.score !== null) setScore(subData.score.toString());

      // Fetch student details if studentId exists
      if (subData.studentId) {
        const studentData = await studentService.getStudentById(subData.studentId).catch(() => null);
        setStudent(studentData);
      }

    } catch (error) {
      console.error("Error fetching submission details:", error);
      Alert.alert("Lỗi", "Không thể tải chi tiết bài nộp.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleGrade = async () => {
    if (!score.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập điểm.");
      return;
    }

    const numericScore = parseFloat(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 10) {
      Alert.alert("Lỗi", "Vui lòng nhập điểm hợp lệ (từ 0 đến 10).");
      return;
    }

    try {
      setSubmitting(true);
      await submissionService.scoreSubmission(id as string, numericScore);
      
      Alert.alert("Thành công", "Đã chấm điểm thành công", [
        { text: "Đồng ý", onPress: () => fetchDetails() } // Refresh to show graded status
      ]);
    } catch (error: any) {
      console.error("Error grading submission:", error);
      Alert.alert("Lỗi", error.response?.data?.message || "Lỗi khi chấm điểm bài nộp");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-yellow-100 text-yellow-700';
    switch (status) {
      case 'graded': return 'bg-green-100 text-green-700';
      case 'late': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const statusMap: any = {
    'graded': 'Đã chấm',
    'late': 'Nộp trễ',
    'pending': 'Chờ chấm',
    'submitted': 'Đã nộp'
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar hidden />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-black text-lg">
          Chấm điểm bài nộp
        </Text>
        <View className="w-10" />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : submission ? (
        <ScrollView className="flex-1 px-6 py-6" contentContainerStyle={{ paddingBottom: 100 }}>
          
          {/* Submission Info Card */}
          <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-lg mb-1">
                  {submission.fileTitle}
                </Text>
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-sm">
                  Học sinh: {student ? student.fullName : submission.studentId}
                </Text>
              </View>
              <View className={`px-3 py-1 rounded-full ${getStatusColor(submission.status).split(' ')[0]}`}>
                <Text style={{ fontFamily: "Poppins-SemiBold" }} className={`text-xs uppercase ${getStatusColor(submission.status).split(' ')[1]}`}>
                  {statusMap[submission.status || ''] || submission.status || 'Chờ chấm'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mb-4">
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={{ fontFamily: "Poppins-Regular" }} className="text-gray-500 text-xs ml-1">
                Nộp lúc: {new Date(submission.timeSubmit).toLocaleString('vi-VN')}
              </Text>
            </View>

            {submission.fileUrl ? (
              <TouchableOpacity 
                onPress={() => Linking.openURL(submission.fileUrl!)}
                className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <Ionicons name="document-attach" size={20} color="#4F46E5" />
                  <Text style={{ fontFamily: "Poppins-Medium" }} className="text-indigo-600 ml-2">Xem file đính kèm</Text>
                </View>
                <Ionicons name="open-outline" size={18} color="#4F46E5" />
              </TouchableOpacity>
            ) : (
              <View className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex-row items-center">
                 <Ionicons name="document-text-outline" size={20} color="#9CA3AF" />
                 <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 ml-2">Không có tài liệu đính kèm</Text>
              </View>
            )}
          </View>

          {/* Grading Form */}
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-xl mb-4 ml-1">
            Chấm điểm
          </Text>

          <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            {/* Score Input */}
            <View className="mb-6">
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-700 text-sm mb-1.5 ml-1">
                Điểm số (0 - 10) <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={score}
                onChangeText={setScore}
                placeholder="10"
                keyboardType="numeric"
                autoFocus={true}
                maxLength={4}
                placeholderTextColor="#9ca3af"
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 text-black"
                style={{ 
                  fontFamily: "Poppins-Bold", 
                  fontSize: 20, 
                  height: 64,
                  textAlign: 'center'
                }}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleGrade}
              disabled={submitting}
              className={`rounded-2xl py-4 items-center flex-row justify-center ${
                submitting ? "bg-emerald-300" : "bg-emerald-600"
              }`}
              style={{ shadowColor: "#059669", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-done-circle-outline" size={20} color="white" className="mr-2" />
                  <Text style={{ fontFamily: "Poppins-Bold" }} className="text-white text-base ml-2">
                    {submission.status === 'graded' ? 'Cập nhật điểm' : 'Lưu kết quả'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

        </ScrollView>
      ) : (
         <View className="flex-1 justify-center items-center">
            <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500">Không tìm thấy bài nộp.</Text>
         </View>
      )}

    </SafeAreaView>
  );
}
