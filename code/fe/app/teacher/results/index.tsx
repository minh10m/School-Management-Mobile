import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { resultService } from "../../../services/result.service";
import { classYearService } from "../../../services/classYear.service";
import { teacherService } from "../../../services/teacher.service";
import { useAuthStore } from "../../../store/authStore";
import { ClassYearSummary } from "../../../types/classYear";
import { TeacherSubject } from "../../../types/teacher";
import { StudentResultForTeacherResponse } from "../../../types/result";
import { useConfigStore } from "../../../store/configStore";

export default function TeacherResults() {
  const { userInfo } = useAuthStore();
  const { schoolYear } = useConfigStore();
  const [classes, setClasses] = useState<ClassYearSummary[]>([]);
  const [subjects, setSubjects] = useState<TeacherSubject[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [term, setTerm] = useState<number>(1);
  const [results, setResults] = useState<StudentResultForTeacherResponse[]>([]);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [allSubjectsInClass, setAllSubjectsInClass] = useState<
    { id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ─── Lifecycle & Data Fetching ──────────────────────────────────────────────

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      console.log(
        "[AGENT] selectedClass changed, fetching results for class:",
        selectedClass,
      );
      fetchResults();
    }
  }, [selectedClass, term]);

  /**
   * Identifies all unique subjects available across students and
   * calculates class-wide statistics for the summary header.
   */
  useEffect(() => {
    if (Array.isArray(results) && results.length > 0) {
      const subjectMap = new Map<string, string>();
      results.forEach((student) => {
        if (student.subjectResults && Array.isArray(student.subjectResults)) {
          student.subjectResults.forEach((sub) => {
            subjectMap.set(sub.subjectId, sub.subjectName);
          });
        }
      });
      const uniqueSubjects = Array.from(subjectMap.entries()).map(
        ([id, name]) => ({ id, name }),
      );
      console.log(
        "[AGENT] Identified unique subjects in class:",
        uniqueSubjects.length,
      );
      setAllSubjectsInClass(uniqueSubjects);
    } else {
      setAllSubjectsInClass([]);
    }
  }, [results]);

  /**
   * Fetches initial teacher data including the profile (for teacherId),
   * teaching classes, and subjects.
   */
  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const teacherProfile = await teacherService.getMe();
      const currentTeacherId = teacherProfile.teacherId;
      setTeacherId(currentTeacherId);

      // Fetch teaching classes and subjects in parallel
      const [teachingClasses, teacherSubjects] = await Promise.all([
        classYearService.getTeachingClasses({ schoolYear: schoolYear.toString() }),
        teacherService.getTeacherSubjects(currentTeacherId),
      ]);

      console.log(
        "[AGENT] Fetched initial data. Classes:",
        teachingClasses?.length,
        "Subjects:",
        teacherSubjects?.length,
      );

      setClasses(Array.isArray(teachingClasses) ? teachingClasses : []);
      setSubjects(Array.isArray(teacherSubjects) ? teacherSubjects : []);

      if (Array.isArray(teachingClasses) && teachingClasses.length > 0) {
        setSelectedClass(teachingClasses[0].classYearId);
      } else {
        console.warn(
          "[AGENT] No teaching classes found for this teacher in",
          schoolYear,
        );
      }
    } catch (error) {
      console.error("[AGENT] Error fetching initial data:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu giảng dạy. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches class results based on selected class and term.
   */
  const fetchResults = async () => {
    if (!selectedClass) return;
    try {
      setLoading(true);
      const data = await resultService.getClassResults(selectedClass, {
        term: term,
      });
      console.log(
        "[AGENT] Fetched class results. Students found:",
        data?.length,
      );
      setResults(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("[AGENT] Error fetching class results:", error);
      // More descriptive error handling
      if (error.response?.status === 403) {
        Alert.alert(
          "Truy cập bị từ chối",
          "Bạn không có quyền xem kết quả cho lớp này.",
        );
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Statistics for the summary bar.
   */
  const getClassStats = () => {
    const totalStudents = Array.isArray(results) ? results.length : 0;
    const totalSubjects = allSubjectsInClass.length;

    let totalScore = 0;
    let scoreCount = 0;

    if (Array.isArray(results)) {
      results.forEach((s) => {
        if (s.subjectResults && Array.isArray(s.subjectResults)) {
          s.subjectResults.forEach((sub) => {
            totalScore += sub.average;
            scoreCount++;
          });
        }
      });
    }

    const classAverage =
      scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : "0.0";

    return { totalStudents, totalSubjects, classAverage };
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchResults();
    setRefreshing(false);
  }, [selectedClass, term]);

  const { totalStudents, totalSubjects, classAverage } = getClassStats();

  // ─── Render Helpers ─────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header Bar */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color="#000" />
        </TouchableOpacity>
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className="text-black text-lg"
        >
          Quản lý Điểm số
        </Text>
        <TouchableOpacity
          onPress={fetchResults}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Ionicons name="refresh" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFF"
          />
        }
      >
        {/* Banner/Introduction */}
        <View className="px-6 py-6">
          <Text
            className="text-gray-400 text-xs mb-1"
            style={{ fontFamily: "Poppins-Medium" }}
          >
            Học kỳ {term} • {schoolYear} - {schoolYear + 1}
          </Text>
          <Text
            className="text-black text-2xl"
            style={{ fontFamily: "Poppins-Bold" }}
          >
            Sổ điểm lớp học
          </Text>
        </View>

        {/* Filters and Stats */}
        <View className="bg-white pb-4">
          {/* Summary Stats Cards */}
          <View className="flex-row px-6 gap-3 mb-6">
            <StatCard
              label="Học sinh"
              value={totalStudents}
              color="text-gray-800"
              bg="bg-white"
            />
            <StatCard
              label="Điểm TB Lớp"
              value={classAverage}
              color="text-[#0D9488]"
              bg="bg-white"
            />
            <StatCard
              label="Môn học"
              value={totalSubjects}
              color="text-gray-800"
              bg="bg-white"
            />
          </View>

          {/* Controls: Class Selector & Term Switch */}
          <View className="px-6 flex-row items-center justify-between">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-1 mr-4"
            >
              {classes.map((cls) => (
                <TouchableOpacity
                  key={cls.classYearId}
                  onPress={() => setSelectedClass(cls.classYearId)}
                  className={`mr-2 px-4 py-2 rounded-xl border ${selectedClass === cls.classYearId ? "bg-blue-600 border-blue-600" : "bg-gray-50 border-gray-100"}`}
                >
                  <Text
                    className={`text-sm ${selectedClass === cls.classYearId ? "text-white" : "text-gray-500"}`}
                    style={{ fontFamily: "Poppins-Bold" }}
                  >
                    {cls.className}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="flex-row bg-gray-100 rounded-xl p-1 shrink-0">
              {[1, 2].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTerm(t)}
                  className={`px-3 py-1.5 rounded-lg ${term === t ? "bg-white shadow-sm" : ""}`}
                >
                  <Text
                    className={`text-[10px] ${term === t ? "text-blue-600" : "text-gray-500"}`}
                    style={{ fontFamily: "Poppins-Bold" }}
                  >
                    T{t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Matrix Table Area */}
        <View className="px-6 pb-20">
          {loading && !refreshing ? (
            <View className="py-20">
              <ActivityIndicator size="large" color="#136ADA" />
            </View>
          ) : results.length === 0 ? (
            <View className="py-20 items-center">
              <View className="w-16 h-16 rounded-full bg-gray-50 items-center justify-center mb-4">
                <Ionicons name="clipboard-outline" size={32} color="#D1D5DB" />
              </View>
              <Text
                className="text-gray-400"
                style={{ fontFamily: "Poppins-Regular" }}
              >
                {selectedClass
                  ? "Không có dữ liệu học tập"
                  : "Vui lòng chọn một lớp"}
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="rounded-3xl border border-gray-100 overflow-hidden shadow-sm"
            >
              <View className="bg-white">
                {/* Table Header Row */}
                <View className="flex-row items-center bg-blue-50/50 border-b border-gray-100 py-4">
                  <View className="w-40 px-6">
                    <Text
                      className="text-gray-500 text-[10px] uppercase tracking-widest"
                      style={{ fontFamily: "Poppins-Bold" }}
                    >
                      Học sinh
                    </Text>
                  </View>
                  {allSubjectsInClass.map((sub) => (
                    <View
                      key={sub.id}
                      className="w-28 items-center border-l border-gray-100"
                    >
                      <Text
                        className="text-gray-500 text-[10px] uppercase tracking-widest text-center"
                        style={{ fontFamily: "Poppins-Bold" }}
                      >
                        {sub.name}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Table Body Rows */}
                {results.map((student) => (
                  <View
                    key={student.studentId}
                    className="flex-row items-center border-b border-gray-100 py-4"
                  >
                    <View className="w-40 px-6">
                      <Text
                        className="text-gray-800 text-sm"
                        style={{ fontFamily: "Poppins-Bold" }}
                      >
                        {student.studentName}
                      </Text>
                    </View>
                    {allSubjectsInClass.map((sub) => {
                      const subjectResult = Array.isArray(
                        student.subjectResults,
                      )
                        ? student.subjectResults.find(
                            (r) => r.subjectId === sub.id,
                          )
                        : null;
                      const avg = subjectResult?.average || 0;
                      return (
                        <TouchableOpacity
                          key={sub.id}
                          onPress={() =>
                            router.push(
                              `/teacher/manage-result?studentId=${student.studentId}&classYearId=${selectedClass}&subjectId=${sub.id}&term=${term}` as any,
                            )
                          }
                          className="w-28 items-center border-l border-gray-100"
                        >
                          {subjectResult ? (
                            <ScoreBadge value={avg} />
                          ) : (
                            <Text className="text-gray-300">—</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function StatCard({ label, value, color, bg }: any) {
  return (
    <View
      className={`flex-1 rounded-2xl p-4 py-5 ${bg} items-center border border-gray-100 shadow-sm`}
    >
      <Text
        className="text-gray-400 text-[10px] uppercase mb-1"
        style={{ fontFamily: "Poppins-Medium" }}
      >
        {label}
      </Text>
      <Text
        className={`text-2xl ${color}`}
        style={{ fontFamily: "Poppins-Bold" }}
      >
        {value}
      </Text>
    </View>
  );
}

function ScoreBadge({ value }: { value: number }) {
  const getColors = () => {
    if (value >= 8.5)
      return {
        text: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
      };
    if (value >= 8.0)
      return {
        text: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
      };
    if (value >= 5.0)
      return {
        text: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-100",
      };
    return {
      text: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-100",
    };
  };

  const colors = getColors();

  return (
    <View
      className={`px-3 py-1 rounded-full border ${colors.bg} ${colors.border}`}
    >
      <Text
        className={`text-xs ${colors.text}`}
        style={{ fontFamily: "Poppins-Bold" }}
      >
        {value.toFixed(1)}
      </Text>
    </View>
  );
}
