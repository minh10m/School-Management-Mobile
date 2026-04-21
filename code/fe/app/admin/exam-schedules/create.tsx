import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";
import { StatusBar } from "expo-status-bar";
import { examScheduleService } from "../../../services/examSchedule.service";
import { FormActionButton } from "../../../components/ui/FormActionButton";
import { getErrorMessage } from "../../../utils/error";

export default function CreateExamScheduleScreen() {
  const router = useRouter();
  const [type, setType] = useState("");
  const [term, setTerm] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [grade, setGrade] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!type.trim() || !term.trim() || !schoolYear.trim() || !grade.trim()) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin các trường.");
      return;
    }

    const numericGrade = parseInt(grade, 10);
    if (isNaN(numericGrade) || numericGrade < 1 || numericGrade > 12) {
      Alert.alert("Lỗi", "Vui lòng nhập Khối lớp hợp lệ (VD: 10, 11, 12).");
      return;
    }

    try {
      setLoading(true);

      // Map Term string to number (HK1 -> 1, HK2 -> 2)
      const numericTerm = term.toUpperCase().includes("2") ? 2 : 1;

      // Map School Year string to number (2025-2026 -> 2025)
      const yearMatch = schoolYear.match(/\d{4}/);
      const numericYear = yearMatch
        ? parseInt(yearMatch[0], 10)
        : new Date().getFullYear();

      // Generate Title (since it is [Required] in your updated Backend DTO)
      const generatedTitle = `${type} - ${term} - ${schoolYear} - Grade ${grade}`;

      await examScheduleService.createSchedule({
        type: type.trim(),
        title: generatedTitle,
        term: numericTerm,
        schoolYear: numericYear,
        grade: numericGrade,
        isActive: true,
      });

      Alert.alert("Thành công", "Đã tạo lịch thi thành công", [
        { text: "Đồng ý", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error("Error creating exam schedule:", error);
      Alert.alert("Lỗi", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPageWrapper
      title="Lịch thi mới"
    >

      <ScrollView
        className="flex-1 px-6 py-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          {/* Input: Type */}
          <View className="mb-4">
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-700 text-sm mb-1.5 ml-1"
            >
              Loại kỳ thi <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={type}
              onChangeText={setType}
              placeholder="VD: Giữa kỳ, Cuối kỳ"
              placeholderTextColor="#9ca3af"
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-black text-sm"
              style={{ fontFamily: "Poppins-Regular" }}
            />
          </View>

          {/* Input: Term */}
          <View className="mb-4">
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-700 text-sm mb-1.5 ml-1"
            >
              Học kỳ <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={term}
              onChangeText={setTerm}
              placeholder="VD: 1, 2"
              placeholderTextColor="#9ca3af"
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-black text-sm"
              style={{ fontFamily: "Poppins-Regular" }}
            />
          </View>

          {/* Input: School Year */}
          <View className="mb-4">
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-700 text-sm mb-1.5 ml-1"
            >
              Năm học <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={schoolYear}
              onChangeText={setSchoolYear}
              placeholder="VD: 2026"
              placeholderTextColor="#9ca3af"
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-black text-sm"
              style={{ fontFamily: "Poppins-Regular" }}
            />
          </View>

          {/* Input: Grade */}
          <View className="mb-6">
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-700 text-sm mb-1.5 ml-1"
            >
              Khối lớp <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={grade}
              onChangeText={setGrade}
              placeholder="VD: 10, 11, 12"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-black text-sm"
              style={{ fontFamily: "Poppins-Regular" }}
            />
          </View>

          </View>
      </ScrollView>
      <FormActionButton
        title="Tạo Lịch thi"
        onPress={handleCreate}
        loading={loading}
      />
    </AdminPageWrapper>
  );
}
