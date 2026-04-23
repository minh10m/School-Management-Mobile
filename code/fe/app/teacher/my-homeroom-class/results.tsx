import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { resultService } from "../../../services/result.service";
import { classYearService } from "../../../services/classYear.service";
import { StudentResultForTeacherResponse } from "../../../types/result";
import { useConfigStore } from "../../../store/configStore";

export default function HomeroomResultsScreen() {
  const { schoolYear, term: globalTerm } = useConfigStore();
  const [homeroomClass, setHomeroomClass] = useState<any>(null);
  const [term, setTerm] = useState<number>(globalTerm);
  const fetchingTermRef = useRef<number>(globalTerm);
  const [results, setResults] = useState<StudentResultForTeacherResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New states for Student List & Detail UI
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentDetail, setStudentDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const fetchHomeroomInfo = useCallback(async () => {
    try {
      setLoading(true);
      const hr = await classYearService.getHomeroomClass(schoolYear);
      if (hr) {
        setHomeroomClass(hr);
      } else {
        setLoading(false);
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setHomeroomClass(null);
      }
      setLoading(false);
    }
  }, [schoolYear]);

  const fetchResults = useCallback(async () => {
    if (!homeroomClass?.classYearId) return;
    const currentTerm = term;
    fetchingTermRef.current = currentTerm;
    
    try {
      setLoading(true);
      const data = await resultService.getClassResults(
        homeroomClass.classYearId,
        { term: currentTerm },
      );
      
      // Only update if this is still the term we want
      if (fetchingTermRef.current === currentTerm) {
        setResults(Array.isArray(data) ? data : []);
      }
    } catch (error: any) {
      if (fetchingTermRef.current === currentTerm) {
        if (error.response?.status === 403) {
          Alert.alert(
            "Truy cập bị từ chối",
            "Bạn không phải giáo viên chủ nhiệm của lớp này.",
          );
        }
        setResults([]);
      }
    } finally {
      if (fetchingTermRef.current === currentTerm) {
        setLoading(false);
      }
    }
  }, [homeroomClass?.classYearId, term]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchResults();
    setRefreshing(false);
  }, [fetchResults]);

  useEffect(() => {
    fetchHomeroomInfo();
  }, [fetchHomeroomInfo]);

  useEffect(() => {
    if (homeroomClass?.classYearId) {
      fetchResults();
    }
  }, [fetchResults, homeroomClass?.classYearId]);

  const fetchStudentDetail = async (studentId: string) => {
    if (!homeroomClass?.classYearId) return;
    try {
      setLoadingDetail(true);
      setIsDetailModalVisible(true);
      const data = await resultService.getOneStudentResultForTeacher(
        homeroomClass.classYearId,
        studentId,
        { term },
      );
      setStudentDetail(data);
    } catch (error) {
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredResults = (Array.isArray(results) ? results : []).filter((s) =>
    s?.studentName?.toLowerCase().includes(search.toLowerCase()),
  );

  const statsData = useMemo(() => {
    // ✅ Guard — đảm bảo results luôn là array
    const safeResults = Array.isArray(results) ? results : [];

    const totalStudents = safeResults.length;
    const subjectMap = new Map();
    safeResults.forEach((s) =>
      s?.subjectResults?.forEach((sub: any) =>
        subjectMap.set(sub.subjectId, true),
      ),
    );
    const totalSubjects = subjectMap.size;

    let totalScore = 0;
    let scoreCount = 0;
    safeResults.forEach((s) => {
      s?.subjectResults?.forEach((sub: any) => {
        if (
          typeof sub.averageSubject === "number" &&
          !isNaN(sub.averageSubject)
        ) {
          totalScore += sub.averageSubject;
          scoreCount++;
        }
      });
    });

    const classAverage =
      scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : "0.0";

    const stats = {
      xuatSac: safeResults.filter((s) => s?.rating === "Xuất sắc").length,
      gioi: safeResults.filter((s) => s?.rating === "Giỏi").length,
      kha: safeResults.filter((s) => s?.rating === "Khá").length,
      trungBinh: safeResults.filter((s) => s?.rating === "Trung bình").length,
      yeu: safeResults.filter((s) => s?.rating === "Yếu").length,
      chuaXepLoai: safeResults.filter(
        (s) => !s?.rating || s?.rating === "Chưa xếp loại",
      ).length,
    };

    return { totalStudents, totalSubjects, classAverage, stats };
  }, [results]);

  const { totalStudents, totalSubjects, classAverage, stats } = statsData;

  const pieChartHtml = useMemo(() => {
    if (totalStudents === 0) return "";
    const total = totalStudents;
    const data = [
      { v: stats.xuatSac, c: "#10B981" }, // Emerald
      { v: stats.gioi, c: "#136ADA" }, // Blue
      { v: stats.kha, c: "#6366F1" }, // Indigo
      { v: stats.trungBinh, c: "#F59E0B" }, // Amber
      { v: stats.yeu, c: "#EF4444" }, // Red
      { v: stats.chuaXepLoai, c: "#E5E7EB" }, // Gray
    ];

    let offset = 0;
    const circles = data
      .map((d) => {
        const percent = (d.v / total) * 100;
        if (percent === 0) return "";
        const dashArray = `${percent} 100`;
        const dashOffset = -offset;
        offset += percent;
        return `<circle r="16" cx="16" cy="16" stroke="${d.c}" stroke-dasharray="${dashArray}" stroke-dashoffset="${dashOffset}" />`;
      })
      .join("");

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; background: transparent; }
            svg { transform: rotate(-90deg); border-radius: 50%; }
            circle { fill: transparent; stroke-width: 32; }
          </style>
        </head>
        <body>
          <svg width="100" height="100" viewBox="0 0 32 32">
            ${circles}
          </svg>
        </body>
      </html>
    `;
  }, [stats, totalStudents]);

  if (loading && !refreshing && !homeroomClass) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#136ADA" />
        <Text
          className="mt-4 text-gray-400"
          style={{ fontFamily: "Poppins-Regular" }}
        >
          Đang tải dữ liệu lớp chủ nhiệm...
        </Text>
      </View>
    );
  }

  if (!homeroomClass && !loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#D1D5DB" />
        <Text
          className="text-xl mt-4 text-center"
          style={{ fontFamily: "Poppins-Bold" }}
        >
          Không tìm thấy lớp chủ nhiệm
        </Text>
        <Text
          className="text-gray-400 text-center mt-2"
          style={{ fontFamily: "Poppins-Regular" }}
        >
          Bạn có thể liên hệ quản trị viên để cập nhật thông tin lớp chủ nhiệm
          năm học {schoolYear}.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-8 bg-blue-600 px-8 py-3 rounded-2xl"
        >
          <Text className="text-white" style={{ fontFamily: "Poppins-Bold" }}>
            Quay lại
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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
          Bảng điểm lớp {homeroomClass?.className}
        </Text>
        <View className="w-10" />
      </View>

      {/* Top Tab Bar */}
      <View className="flex-row bg-white border-b border-gray-100">
        {[1, 2].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTerm(t)}
            className="flex-1 items-center pt-4 pb-3"
          >
            <Text
              className={`text-sm ${term === t ? "text-blue-600" : "text-gray-400"}`}
              style={{ fontFamily: term === t ? "Poppins-Bold" : "Poppins-Medium" }}
            >
              Học kỳ {t}
            </Text>
            {term === t && (
              <View className="absolute bottom-0 w-16 h-[3px] bg-blue-600 rounded-full" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#136ADA"
          />
        }
      >
        {/* Banner */}
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
            Kết quả học tập
          </Text>
        </View>

        {/* Academic Distribution Chart */}
        <View className="px-6 py-4">
          <View className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm shadow-blue-50/50 flex-row items-center">
            {/* Pie Chart */}
            <View className="w-32 h-32 mr-6">
              <WebView
                originWhitelist={["*"]}
                scrollEnabled={false}
                style={{ backgroundColor: "transparent" }}
                source={{ html: pieChartHtml }}
              />
            </View>

            {/* Legend */}
            <View className="flex-1 gap-y-1">
              <LegendItem
                color="bg-emerald-500"
                label="Xuất sắc"
                count={stats.xuatSac}
              />
              <LegendItem color="bg-blue-600" label="Giỏi" count={stats.gioi} />
              <LegendItem color="bg-indigo-500" label="Khá" count={stats.kha} />
              <LegendItem
                color="bg-amber-500"
                label="Trung bình"
                count={stats.trungBinh}
              />
              <LegendItem color="bg-red-500" label="Yếu" count={stats.yeu} />
              <LegendItem
                color="bg-gray-300"
                label="Chưa xét"
                count={stats.chuaXepLoai}
              />
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="flex-row px-6 gap-3 mb-6">
          <StatCard
            label="Học sinh"
            value={totalStudents}
            color="text-gray-400"
            valueColor="text-gray-800"
            bg="bg-white"
          />
          <StatCard
            label="Điểm TB Lớp"
            value={classAverage}
            color="text-gray-400"
            valueColor="text-[#0D9488]"
            bg="bg-white"
          />
          <StatCard
            label="Môn học"
            value={totalSubjects}
            color="text-gray-400"
            valueColor="text-gray-800"
            bg="bg-white"
          />
        </View>

        <View className="px-6 mb-4">
          <Text
            className="text-gray-400 text-[10px] uppercase tracking-[2px]"
            style={{ fontFamily: "Poppins-Bold" }}
          >
            Danh sách học sinh
          </Text>
        </View>

        {/* Search Bar */}
        <View className="px-6 py-4">
          <View className="bg-gray-50 px-4 py-3 rounded-2xl flex-row items-center border border-gray-100">
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              placeholder="Tìm tên học sinh..."
              value={search}
              onChangeText={setSearch}
              className="flex-1 ml-2 text-sm text-gray-800"
              style={{ fontFamily: "Poppins-Medium" }}
            />
          </View>
        </View>

        {/* Student List Content */}
        <View className="px-6 pb-20">
          {loading && !refreshing ? (
            <View className="py-20">
              <ActivityIndicator size="large" color="#136ADA" />
            </View>
          ) : filteredResults.length === 0 ? (
            <View className="py-20 items-center">
              <View className="w-16 h-16 rounded-full bg-gray-50 items-center justify-center mb-4">
                <Ionicons name="people-outline" size={32} color="#D1D5DB" />
              </View>
              <Text
                className="text-gray-400"
                style={{ fontFamily: "Poppins-Regular" }}
              >
                Không tìm thấy học sinh nào
              </Text>
            </View>
          ) : (
            <View className="gap-y-4">
              {filteredResults.map((student) => (
                <StudentListItem
                  key={student.studentId}
                  student={student}
                  onPress={() => {
                    setSelectedStudent(student);
                    fetchStudentDetail(student.studentId);
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Student Detail Modal */}
      <Modal
        visible={isDetailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDetailModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[40px] h-[85%] px-6 pt-8">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-6">
              <View>
                <Text
                  className="text-2xl"
                  style={{ fontFamily: "Poppins-Bold" }}
                >
                  {selectedStudent?.studentName}
                </Text>
                <Text
                  className="text-gray-400 text-xs"
                  style={{ fontFamily: "Poppins-Medium" }}
                >
                  Mã số: {selectedStudent?.studentId.slice(0, 8).toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsDetailModalVisible(false)}
                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              >
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            {loadingDetail ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#136ADA" />
                <Text
                  className="text-gray-400 mt-4"
                  style={{ fontFamily: "Poppins-Medium" }}
                >
                  Đang tải bảng điểm...
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
              >
                {/* Score Summary Card */}
                <View className="bg-blue-600 rounded-3xl p-6 mb-6 flex-row items-center justify-between shadow-lg shadow-blue-300">
                  <View>
                    <Text
                      className="text-blue-100 text-xs uppercase"
                      style={{ fontFamily: "Poppins-Bold" }}
                    >
                      TB Học Kỳ {term}
                    </Text>
                    <Text
                      className="text-white text-4xl"
                      style={{ fontFamily: "Poppins-Bold" }}
                    >
                      {selectedStudent?.average?.toFixed(1) || "0.0"}
                    </Text>
                  </View>
                  <View className="bg-white/20 px-4 py-2 rounded-2xl">
                    <Text
                      className="text-white text-lg"
                      style={{ fontFamily: "Poppins-Bold" }}
                    >
                      {selectedStudent?.rating || "Chưa xếp loại"}
                    </Text>
                  </View>
                </View>

                <Text
                  className="text-gray-400 text-[10px] uppercase tracking-widest mb-4 ml-1"
                  style={{ fontFamily: "Poppins-Bold" }}
                >
                  Chi tiết từng môn
                </Text>

                {studentDetail?.subjectResults?.map((sub: any) => (
                  <View
                    key={sub.subjectId}
                    className="bg-gray-50 rounded-3xl p-5 mb-4 border border-gray-100"
                  >
                    <View className="flex-row items-center justify-between mb-4">
                      <Text
                        className="text-gray-800 text-base"
                        style={{ fontFamily: "Poppins-Bold" }}
                      >
                        {sub.subjectName}
                      </Text>
                      <View className="bg-blue-100 px-3 py-1 rounded-xl">
                        <Text
                          className="text-blue-600 text-sm"
                          style={{ fontFamily: "Poppins-Bold" }}
                        >
                          {sub.averageSubject?.toFixed(1)}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row flex-wrap gap-2">
                      {sub.detailResults?.map((res: any, idx: number) => (
                        <View
                          key={idx}
                          className="bg-white px-3 py-2 rounded-2xl border border-gray-100 items-center min-w-[70px]"
                        >
                          <Text
                            className="text-[10px] text-gray-400 uppercase"
                            style={{ fontFamily: "Poppins-Medium" }}
                          >
                            {res.type}
                          </Text>
                          <Text
                            className="text-gray-800 text-sm"
                            style={{ fontFamily: "Poppins-Bold" }}
                          >
                            {res.value}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
                <View className="h-10" />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function StudentListItem({ student, onPress }: any) {
  const avg = student.average || 0;
  const rating = student.rating || "Chưa xếp loại";
  const initial =
    student.studentName.split(" ").at(-1)?.[0]?.toUpperCase() ?? "?";

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-3xl p-4 flex-row items-center border border-gray-100 shadow-sm shadow-gray-50"
    >
      <View className="w-12 h-12 rounded-2xl bg-blue-50 items-center justify-center mr-4">
        <Text
          className="text-blue-600 text-lg"
          style={{ fontFamily: "Poppins-Bold" }}
        >
          {initial}
        </Text>
      </View>
      <View className="flex-1">
        <Text
          className="text-gray-800 text-base"
          style={{ fontFamily: "Poppins-Bold" }}
        >
          {student.studentName}
        </Text>
        <Text
          className="text-gray-400 text-[10px]"
          style={{ fontFamily: "Poppins-Medium" }}
        >
          Mã số: {student.studentId.slice(0, 8).toUpperCase()}
        </Text>
      </View>
      <View className="items-end">
        <View className="bg-emerald-50 px-3 py-1 rounded-xl">
          <Text
            className="text-emerald-600 text-sm"
            style={{ fontFamily: "Poppins-Bold" }}
          >
            {avg.toFixed(1)}
          </Text>
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color="#E5E7EB"
        style={{ marginLeft: 12 }}
      />
    </TouchableOpacity>
  );
}

function LegendItem({ color, label, count }: any) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center">
        <View className={`w-2 h-2 rounded-full ${color} mr-2`} />
        <Text
          style={{ fontFamily: "Poppins-Medium" }}
          className="text-gray-500 text-[10px]"
        >
          {label}
        </Text>
      </View>
      <Text
        style={{ fontFamily: "Poppins-Bold" }}
        className="text-gray-800 text-[10px]"
      >
        {count}
      </Text>
    </View>
  );
}

function StatCard({ label, value, color, valueColor, bg }: any) {
  return (
    <View
      className={`flex-1 rounded-3xl p-4 py-6 ${bg} items-center border border-gray-100 shadow-sm shadow-gray-50`}
    >
      <Text
        className={`${color} text-[10px] uppercase mb-1 tracking-wider`}
        style={{ fontFamily: "Poppins-Bold" }}
      >
        {label}
      </Text>
      <Text
        className={`text-3xl ${valueColor}`}
        style={{ fontFamily: "Poppins-Bold" }}
      >
        {value}
      </Text>
    </View>
  );
}
