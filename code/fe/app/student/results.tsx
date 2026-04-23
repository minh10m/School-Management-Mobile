import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useMemo } from "react";
import { resultService } from "../../services/result.service";
import { StudentResultSubject, StudentResultReport, DetailResult } from "../../types/result";
import { useAuthStore } from "../../store/authStore";
import { useConfigStore } from "../../store/configStore";

export default function ResultsScreen() {
  const { userInfo } = useAuthStore();
  const { schoolYear, term: storeTerm } = useConfigStore();
  const [results, setResults] = useState<StudentResultSubject[]>([]);
  const [overall, setOverall] = useState<{ average?: number; rating?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [schoolYearLabel] = useState(
    `${schoolYear} - ${schoolYear + 1}`,
  );
  const [term, setTerm] = useState<number>(storeTerm);

  // ─── Lifecycle & Data Fetching ──────────────────────────────────────────────

  useEffect(() => {
    fetchResults();
  }, [term]);

  /**
   * Fetches the detailed results for the current logged-in student.
   * [AGENT] This uses the backend's "Me" context based on the auth token.
   */
  const fetchResults = async () => {
    try {
      setLoading(true);
      const data = await resultService.getStudentResults({
        schoolYear: schoolYear,
        term: term,
      });
      setResults(data.subjectResults || []);
      setOverall({ average: data.average, rating: data.rating });
    } catch (error) {
      console.error("[AGENT] Error fetching student results:", error);
      setResults([]);
      setOverall(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text
            className="text-gray-800 text-lg"
            style={{ fontFamily: "Poppins-Bold" }}
          >
            Bảng điểm chi tiết
          </Text>
        </View>
        <View className="w-10" />
      </View>

      {/* Semester Filter */}
      <View className="flex-row px-6 py-3 bg-white gap-4 border-b border-gray-50">
        <TouchableOpacity
          onPress={() => setTerm(1)}
          className={`flex-1 py-2 rounded-xl items-center border ${term === 1 ? "bg-blue-50 border-blue-400" : "bg-gray-50 border-transparent"}`}
        >
          <Text
            className={`text-xs ${term === 1 ? "text-blue-600" : "text-gray-500"}`}
            style={{
              fontFamily: term === 1 ? "Poppins-Bold" : "Poppins-Medium",
            }}
          >
            Học kỳ 1
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTerm(2)}
          className={`flex-1 py-2 rounded-xl items-center border ${term === 2 ? "bg-blue-50 border-blue-400" : "bg-gray-50 border-transparent"}`}
        >
          <Text
            className={`text-xs ${term === 2 ? "text-blue-600" : "text-gray-500"}`}
            style={{
              fontFamily: term === 2 ? "Poppins-Bold" : "Poppins-Medium",
            }}
          >
            Học kỳ 2
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Info Section */}
        <View className="px-6 py-6 bg-gray-50/50">
          <View className="flex-row justify-between items-end">
            <View>
              <Text
                className="text-gray-400 text-xs mb-1"
                style={{ fontFamily: "Poppins-Medium" }}
              >
                Học sinh
              </Text>
              <Text
                className="text-gray-800 text-base"
                style={{ fontFamily: "Poppins-Bold" }}
              >
                {userInfo?.fullName || "---"}
              </Text>
            </View>
            <View className="items-end">
              <Text
                className="text-gray-400 text-xs mb-1"
                style={{ fontFamily: "Poppins-Medium" }}
              >
                Năm học
              </Text>
              <Text
                className="text-gray-800 text-base"
                style={{ fontFamily: "Poppins-Bold" }}
              >
                {schoolYearLabel}
              </Text>
            </View>
          </View>
          <View className="mt-4 flex-row items-center border-t border-gray-100 pt-4">
            <Ionicons name="calendar-outline" size={16} color="#4A90E2" />
            <Text
              className="ml-2 text-gray-600"
              style={{ fontFamily: "Poppins-Medium" }}
            >
              Học kỳ {term}
            </Text>
          </View>
        </View>

        {/* Overall Summary Card */}
        {!loading && overall && (
          <View className="mx-6 mt-4 mb-2 bg-bright-blue rounded-3xl p-5 flex-row items-center justify-between shadow-lg shadow-blue-200">
            <View>
              <Text className="text-white/70 text-[10px] uppercase tracking-widest" style={{ fontFamily: 'Poppins-Bold' }}>Điểm trung bình HK</Text>
              <Text className="text-white text-4xl mt-1" style={{ fontFamily: 'Poppins-Bold' }}>
                {overall.average && overall.average > 0 ? overall.average.toFixed(1) : '---'}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-white/70 text-[10px] uppercase tracking-widest" style={{ fontFamily: 'Poppins-Bold' }}>Xếp loại</Text>
              <View className="bg-white/20 px-4 py-1.5 rounded-full mt-1">
                <Text className="text-white text-sm" style={{ fontFamily: 'Poppins-Bold' }}>
                  {overall.average && overall.average > 0 ? (overall.rating || '---') : 'Chưa có'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {loading ? (
          <View className="py-20">
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
        ) : results.length === 0 ? (
          <View className="py-20 items-center">
            <Ionicons name="document-text-outline" size={48} color="#EEE" />
            <Text
              className="text-gray-400 mt-2"
              style={{ fontFamily: "Poppins-Regular" }}
            >
              Chưa có dữ liệu điểm số
            </Text>
          </View>
        ) : (
          <View className="mt-4">
            {/* Table Header */}
            <View className="flex-row bg-[#F8F9FB] px-4 py-3 border-y border-gray-100">
              <View style={{ flex: 2 }}>
                <Text
                  className="text-gray-500 text-[10px]"
                  style={{ fontFamily: "Poppins-Bold" }}
                >
                  Môn học
                </Text>
              </View>
              <View className="flex-1 items-center">
                <Text
                  className="text-gray-500 text-[10px]"
                  style={{ fontFamily: "Poppins-Bold" }}
                >
                  Miệng
                </Text>
              </View>
              <View className="flex-1 items-center">
                <Text
                  className="text-gray-500 text-[10px]"
                  style={{ fontFamily: "Poppins-Bold" }}
                >
                  15 phút
                </Text>
              </View>
              <View className="flex-1 items-center">
                <Text
                  className="text-gray-500 text-[10px]"
                  style={{ fontFamily: "Poppins-Bold" }}
                >
                   GK
                </Text>
              </View>
              <View className="flex-1 items-center">
                <Text
                  className="text-gray-500 text-[10px]"
                  style={{ fontFamily: "Poppins-Bold" }}
                >
                  CK
                </Text>
              </View>
              <View className="flex-1 items-center">
                <Text
                  className="text-gray-500 text-[10px]"
                  style={{ fontFamily: "Poppins-Bold" }}
                >
                  AVG
                </Text>
              </View>
            </View>

            {/* Table Body */}
            {results.map((item, index) => (
              <ResultRow
                key={item.subjectId}
                item={item}
                isLast={index === results.length - 1}
              />
            ))}
          </View>
        )}

        <View className="p-6">
          <View className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex-row items-center">
            <Ionicons name="information-circle" size={20} color="#4A90E2" />
            <Text
              className="ml-3 text-blue-700 text-[10px] flex-1"
              style={{ fontFamily: "Poppins-Regular" }}
            >
              MIỆNG: Kiểm tra miệng. 15 PHÚT: Kiểm tra 15p. GK: Giữa kỳ. CK: Cuối kì. AVG: TB môn.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ResultRow({
  item,
  isLast,
}: {
  item: StudentResultSubject;
  isLast: boolean;
}) {
  // Map scores
  let miengScore: string = "-";
  let p15Score: string = "-";
  let gkScore: string = "-";
  let ckScore: string = "-";

  item.detailResults.forEach((res) => {
    const type = res.type.toLowerCase();
    if (type.includes("miệng")) {
      miengScore = res.value.toString();
    } else if (type.includes("15")) {
      p15Score = res.value.toString();
    } else if (type.includes("giữa")) {
      gkScore = res.value.toString();
    } else if (type.includes("cuối")) {
      ckScore = res.value.toString();
    }
  });

  const avgValue = useMemo(() => {
    if (item.average !== undefined && item.average !== null) return item.average;
    
    let totalScore = 0;
    let totalWeight = 0;
    
    item.detailResults.forEach(res => {
        totalScore += res.value * res.weight;
        totalWeight += res.weight;
    });
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }, [item.average, item.detailResults]);

  const avgColor =
    avgValue >= 8
      ? "text-green-600"
      : avgValue >= 5
        ? "text-blue-600"
        : "text-red-600";

  return (
    <View
      className={`flex-row px-4 py-4 ${!isLast ? "border-b border-gray-50" : ""} items-center`}
    >
      {/* Subject Name */}
      <View style={{ flex: 2 }}>
        <Text
          className="text-gray-800 text-sm"
          style={{ fontFamily: "Poppins-Medium" }}
        >
          {item.subjectName}
        </Text>
      </View>

      {/* Miệng */}
      <View className="flex-1 items-center">
        <Text
          className="text-gray-800 text-sm"
          style={{ fontFamily: "Poppins-Medium" }}
        >
          {miengScore}
        </Text>
      </View>

      {/* 15 phút */}
      <View className="flex-1 items-center">
        <Text
          className="text-gray-800 text-sm"
          style={{ fontFamily: "Poppins-Medium" }}
        >
          {p15Score}
        </Text>
      </View>

      {/* GK */}
      <View className="flex-1 items-center">
        <Text
          className="text-gray-800 text-sm"
          style={{ fontFamily: "Poppins-Medium" }}
        >
          {gkScore}
        </Text>
      </View>

      {/* CK */}
      <View className="flex-1 items-center">
        <Text
          className="text-gray-800 text-sm"
          style={{ fontFamily: "Poppins-Medium" }}
        >
          {ckScore}
        </Text>
      </View>

      {/* AVG */}
      <View className="flex-1 items-center">
        <View className="bg-gray-50 rounded-lg px-2 py-1 w-full items-center">
          <Text
            className={`text-sm ${avgColor}`}
            style={{ fontFamily: "Poppins-Bold" }}
          >
            {avgValue ? avgValue.toFixed(1) : "---"}
          </Text>
        </View>
      </View>
    </View>
  );
}
