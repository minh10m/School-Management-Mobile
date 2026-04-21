import { useState, useEffect, useCallback, useMemo } from "react";
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

function getGradeColor(avg: number | undefined): {
  text: string;
  bg: string;
  label: string;
} {
  if (avg === undefined)
    return { text: "text-gray-400", bg: "bg-gray-100", label: "Chưa nhập" };
  if (avg >= 9)
    return { text: "text-emerald-700", bg: "bg-emerald-50", label: "Xuất sắc" };
  if (avg >= 8)
    return { text: "text-blue-700", bg: "bg-blue-50", label: "Giỏi" };
  if (avg >= 6.5)
    return { text: "text-indigo-700", bg: "bg-indigo-50", label: "Khá" };
  if (avg >= 5)
    return { text: "text-amber-700", bg: "bg-amber-50", label: "TB" };
  return { text: "text-red-700", bg: "bg-red-50", label: "Yếu" };
}

export default function ClassGrades() {
  const { classId, subjectId, subjectName } = useLocalSearchParams();
  const { schoolYear, term: currentTerm } = useConfigStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [studentResults, setStudentResults] = useState<
    StudentResultForTeacherResponse[]
  >([]);
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

  const filteredResults = studentResults.filter((r) =>
    r.studentName.toLowerCase().includes(search.toLowerCase()),
  );

  // ─── Summary stats ─────────────────────────────────────────────────────────
  const summary = useMemo(() => {
    const total = studentResults.length;
    const withGrades = studentResults.filter((r) =>
      r.subjectResults?.some(
        (s: any) => s.subjectId === subjectId && s.average !== undefined,
      ),
    ).length;
    const averages = studentResults
      .map(
        (r) =>
          r.subjectResults?.find((s: any) => s.subjectId === subjectId)
            ?.average,
      )
      .filter((a): a is number => a !== undefined);
    const classAvg =
      averages.length > 0
        ? averages.reduce((a, b) => a + b, 0) / averages.length
        : undefined;
    return { total, withGrades, classAvg };
  }, [studentResults, subjectId]);

  const avgColor = getGradeColor(summary.classAvg);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar hidden />

      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-black text-lg"
          >
            Bảng điểm lớp học
          </Text>
          <Text
            style={{ fontFamily: "Poppins-Medium" }}
            className="text-gray-400 text-[10px] uppercase"
          >
            {subjectName} • Năm học {schoolYear} • Học kỳ {currentTerm}
          </Text>
        </View>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#136ADA"
          />
        }
      >
        {/* Search */}
        <View className="px-6 py-4 flex-row items-center gap-4">
          <View className="bg-gray-50 px-4 py-3 rounded-2xl flex-row items-center border border-gray-100 flex-1">
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              placeholder="Tìm tên học sinh..."
              value={search}
              onChangeText={setSearch}
              className="flex-1 ml-2 text-sm text-gray-800"
              style={{ fontFamily: "Poppins-Medium" }}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#CBD5E1" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Student List */}
        <View className="px-6">
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#136ADA" className="mt-20" />
          ) : filteredResults.length === 0 ? (
            <View className="py-20 items-center">
              <Ionicons name="stats-chart-outline" size={64} color="#E5E7EB" />
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-400 mt-4"
              >
                {search
                  ? "Không tìm thấy kết quả"
                  : "Chưa có dữ liệu bảng điểm"}
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
        </View>
      </ScrollView>

      {/* ── Floating Action Button: Nhập hàng loạt ───────────────────── */}
      {!loading && (
        <View className="absolute bottom-8 right-6">
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/teacher/my-class/batch-entry",
                params: {
                  classId: classId as string,
                  subjectId: subjectId as string,
                },
              })
            }
            className="bg-[#136ADA] w-14 h-14 rounded-2xl items-center justify-center shadow-xl shadow-blue-300"
            style={{ elevation: 8 }}
          >
            <Ionicons name="pencil" size={22} color="white" />
          </TouchableOpacity>
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-[#136ADA] text-[9px] text-center mt-1 uppercase tracking-wide"
          >
            Hàng loạt
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

function StudentGradeRow({ item, classId, subjectId, term }: any) {
  const subjectResult = item.subjectResults?.find(
    (s: any) => s.subjectId === subjectId,
  );
  const average: number | undefined = subjectResult?.average;
  const gradeColor = getGradeColor(average);
  const initial = item.studentName.split(" ").at(-1)?.[0]?.toUpperCase() ?? "?";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: "/teacher/manage-result",
          params: {
            studentId: item.studentId,
            studentName: item.studentName,
            classYearId: classId,
            subjectId: subjectId,
            term: term,
          },
        })
      }
      className="bg-white border border-gray-100 rounded-3xl p-4 mb-3 shadow-sm flex-row items-center"
    >
      {/* Avatar */}
      <View
        className={`w-11 h-11 rounded-2xl items-center justify-center mr-4 ${gradeColor.bg}`}
      >
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className={gradeColor.text}
        >
          {initial}
        </Text>
      </View>

      {/* Name + ID */}
      <View className="flex-1">
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className="text-gray-800 text-sm"
          numberOfLines={1}
        >
          {item.studentName}
        </Text>
        <Text
          style={{ fontFamily: "Poppins-Medium" }}
          className="text-gray-400 text-[10px]"
        >
          Mã số: {item.studentId.substring(0, 8).toUpperCase()}
        </Text>
      </View>

      {/* Grade Badge */}
      {average !== undefined && (
        <View className={`px-3 py-1.5 rounded-xl mr-3 ${gradeColor.bg}`}>
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className={`text-sm ${gradeColor.text}`}
          >
            {average.toFixed(1)}
          </Text>
          <Text
            style={{ fontFamily: "Poppins-Medium" }}
            className={`text-[9px] text-center ${gradeColor.text} opacity-80`}
          >
            {gradeColor.label}
          </Text>
        </View>
      )}

      {/* Edit icon */}
      <View className="bg-gray-50 w-9 h-9 rounded-xl items-center justify-center">
        <Ionicons name="create-outline" size={16} color="#136ADA" />
      </View>
    </TouchableOpacity>
  );
}
