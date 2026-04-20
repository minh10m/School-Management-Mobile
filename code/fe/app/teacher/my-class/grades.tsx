import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { resultService } from "../../../services/result.service";
import { StudentResultForTeacherResponse } from "../../../types/result";
import { useConfigStore } from "../../../store/configStore";

export default function ClassGrades() {
  const { classId, subjectId, subjectName } = useLocalSearchParams();
  const { schoolYear, term: currentTerm } = useConfigStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [studentResults, setStudentResults] = useState<StudentResultForTeacherResponse[]>([]);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    if (!classId || !subjectId) return;
    try {
      setLoading(true);
      const data = await resultService.getClassResults(classId as string, {
        term: currentTerm || 1,
        subjectId: subjectId as string,
      });
      setStudentResults(data);
    } catch (error) {
      console.error("Error fetching class results:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [classId, subjectId, currentTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filteredResults = studentResults.filter(r => 
    r.studentName.toLowerCase().includes(search.toLowerCase())
  );

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
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-black text-lg">
            Bảng điểm lớp học
          </Text>
          <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px] uppercase">
            {subjectName} • Năm học {schoolYear} • Học kỳ {currentTerm}
          </Text>
        </View>
        <View className="bg-emerald-50 px-3 py-1 rounded-full">
            <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-emerald-600 text-[10px]">Đang mở</Text>
        </View>
      </View>

      <View className="px-6 py-4 bg-gray-50/50 flex-row items-center gap-4">
        <View className="bg-white px-4 py-3 rounded-2xl flex-row items-center border border-gray-100 flex-1">
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput 
                placeholder="Tìm tên học sinh..."
                value={search}
                onChangeText={setSearch}
                className="flex-1 ml-2 text-sm text-gray-800"
                style={{ fontFamily: 'Poppins-Medium' }}
            />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#136ADA" />
        }
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#136ADA" className="mt-20" />
        ) : filteredResults.length === 0 ? (
          <View className="py-20 items-center">
            <Ionicons name="stats-chart-outline" size={64} color="#E5E7EB" />
            <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-4">
              {search ? "Không tìm thấy kết quả" : "Chưa có dữ liệu bảng điểm"}
            </Text>
          </View>
        ) : (
          filteredResults.map((item) => (
            <StudentGradeRow 
                key={item.studentId} 
                item={item} 
                classId={classId as string}
                subjectId={subjectId as string}
                term={currentTerm}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StudentGradeRow({ item, classId, subjectId, term }: any) {
  const subjectResult = item.subjectResults?.find((s: any) => s.subjectId === subjectId);
  const average = subjectResult?.average;

  return (
    <View className="bg-white border border-gray-100 rounded-3xl p-5 mb-4 shadow-sm flex-row items-center">
      <View className="w-10 h-10 rounded-2xl bg-blue-50 items-center justify-center mr-4">
        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-blue-600">
            {item.studentName.split(' ').at(-1)?.[0]}
        </Text>
      </View>
      
      <View className="flex-1">
        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-sm" numberOfLines={1}>
          {item.studentName}
        </Text>
        <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px]">
          Mã số: {item.studentId.substring(0, 8).toUpperCase()}
        </Text>
      </View>

      <View className="items-end mr-4">
        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-blue-600 text-lg">
          {average !== undefined ? average.toFixed(1) : "---"}
        </Text>
        <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-300 text-[8px] uppercase">Trung bình</Text>
      </View>

      <TouchableOpacity 
        onPress={() => router.push({
            pathname: "/teacher/manage-result",
            params: { 
                studentId: item.studentId, 
                studentName: item.studentName,
                classYearId: classId, 
                subjectId: subjectId, 
                term: term 
            }
        })}
        className="bg-gray-50 w-10 h-10 rounded-2xl items-center justify-center"
      >
        <Ionicons name="create-outline" size={18} color="#136ADA" />
      </TouchableOpacity>
    </View>
  );
}
