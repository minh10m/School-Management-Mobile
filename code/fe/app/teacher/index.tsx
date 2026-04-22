import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useCallback } from "react";
import { useAuthStore } from "../../store/authStore";
import { useConfigStore } from "../../store/configStore";
import SideMenu from "../../components/SideMenu";
import { classYearService } from "../../services/classYear.service";
import { attendanceService } from "../../services/attendance.service";
import { scheduleService } from "../../services/schedule.service";
import { AdminPageWrapper } from "../../components/ui/AdminPageWrapper";
export default function TeacherDashboard() {
  const { userInfo } = useAuthStore();
  const { schoolYear, term } = useConfigStore();
  const teacherName = userInfo?.fullName?.split(" ").at(-1) ?? "Giáo viên";

  const [isMenuVisible, setMenuVisible] = useState(false);
  const [homeroomClass, setHomeroomClass] = useState<any>(null);
  const [loadingHomeroom, setLoadingHomeroom] = useState(true);
  const [teachingClasses, setTeachingClasses] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    rate: 0,
    total: 0,
  });
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoadingHomeroom(true);
      setLoadingStats(true);
      const [hrRes, tcRes, schRes] = await Promise.all([
        classYearService.getHomeroomClass(schoolYear),
        classYearService.getTeachingClasses({
          schoolYear: schoolYear.toString(),
        }),
        scheduleService
          .getMyTeachingSchedule({
            Term: term,
            SchoolYear: schoolYear,
          })
          .catch(() => []),
      ]);

      // Map subjects from schedule to teaching classes
      const mappedTeaching = tcRes.map((cls: any) => {
        const match = schRes.find((s: any) => s.className === cls.className);
        return {
          ...cls,
          subjectId: match?.subjectId || cls.subjectId || "",
          subjectName: match?.subjectName || cls.subjectName || "Chưa gán môn",
        };
      });

      setHomeroomClass(hrRes);
      setTeachingClasses(mappedTeaching);
    } catch (err) {
      console.error("Error fetching teacher dashboard data:", err);
    } finally {
      setLoadingHomeroom(false);
      setLoadingStats(false);
    }
  }, [schoolYear, term]);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  const fetchAttendanceStats = useCallback(async (classYearId: string) => {
    try {
      setLoadingAttendance(true);
      const now = new Date();
      const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      const data = await attendanceService.getClassAttendance({
        classYearId,
        date: localToday,
      });

      const present = data.filter(
        (i) => i.status === "present" || i.status === "Có mặt",
      ).length;
      const absent = data.filter(
        (i) => i.status === "absent" || i.status === "Vắng mặt",
      ).length;
      const late = data.filter(
        (i) => i.status === "late" || i.status === "Đi trễ",
      ).length;
      const total = data.length;
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;

      setAttendanceStats({ present, absent, late, rate, total });
    } catch (err) {
      console.error("Error fetching attendance stats:", err);
    } finally {
      setLoadingAttendance(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (homeroomClass?.classYearId) {
        fetchAttendanceStats(homeroomClass.classYearId);
      }
    }, [homeroomClass, fetchAttendanceStats])
  );

  const TEACHER_STATS = [
    {
      label: "Lớp chủ nhiệm",
      value: homeroomClass ? 1 : 0,
      icon: "star",
      color: "#136ADA",
      bg: "bg-blue-50",
    },
    {
      label: "Lớp giảng dạy",
      value: teachingClasses.length,
      icon: "book",
      color: "#22C55E",
      bg: "bg-green-50",
    },
    {
      label: "Học sinh CN",
      value: homeroomClass?.students?.length || 0,
      icon: "people",
      color: "#A855F7",
      bg: "bg-purple-50",
    },
    {
      label: "Tiết dạy hôm nay",
      value: "04",
      icon: "time",
      color: "#F97316",
      bg: "bg-orange-50",
    },
  ];

  return (
    <AdminPageWrapper
      showLogo={true}
      leftComponent={
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu-outline" size={28} color="black" />
        </TouchableOpacity>
      }
      rightComponent={
        <TouchableOpacity
          onPress={() => router.push("/teacher/notifications" as any)}
        >
          <Ionicons name="notifications-outline" size={28} color="black" />
        </TouchableOpacity>
      }
    >
      <StatusBar hidden />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Welcome Greeting */}
        <View className="px-6 mt-6 mb-2">
          <Text
            style={{ fontFamily: "Poppins-SemiBold" }}
            className="text-black text-xl"
          >
            Chào mừng bạn, {teacherName} 👋
          </Text>
          <Text
            style={{ fontFamily: "Poppins-Regular" }}
            className="text-gray-400 text-xs"
          >
            Hôm nay bạn có 4 tiết dạy.
          </Text>
        </View>

        {/* Homeroom Management Section (Featured) */}
        {homeroomClass && (
          <View className="px-6 mb-8 mt-4">
            <Text
              style={{ fontFamily: "Poppins-SemiBold" }}
              className="text-gray-500 text-xs mb-3 uppercase tracking-widest"
            >
              Quản lý Chủ nhiệm
            </Text>
            <View className="bg-white border border-gray-100 rounded-[40px] p-6 shadow-sm overflow-hidden min-h-[220px] relative">
              {/* Background decoration */}
              <View
                className="absolute right-[-20] top-10 w-40 h-40 bg-blue-500/5 rounded-full"
                style={{ transform: [{ scale: 1.2 }] }}
              />

              <View className="z-10 flex-1 justify-between">
                <View>
                  <Text
                    className="text-[#136ADA] text-sm mb-1"
                    style={{ fontFamily: "Poppins-Bold" }}
                  >
                    Năm học {schoolYear}
                  </Text>

                  <Text
                    className="text-[#136ADA] leading-tight"
                    style={{
                      fontFamily: "Poppins-Bold",
                      fontSize: 38,
                      maxWidth: "80%",
                    }}
                  >
                    Lớp {homeroomClass.className}
                  </Text>
                  <Text
                    style={{ fontFamily: "Poppins-Medium" }}
                    className="text-gray-400 text-xs mt-1"
                  >
                    Bạn đang là Giáo viên chủ nhiệm
                  </Text>
                </View>

                <View className="flex-row items-center gap-2 mt-6">
                  <TouchableOpacity
                    onPress={() => router.push("/teacher/my-homeroom-class")}
                    className="bg-[#136ADA] px-6 py-3 rounded-2xl shadow-md shadow-blue-200"
                  >
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-white text-xs"
                    >
                      Vào lớp học
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Decorative icon */}
              <View className="absolute right-4 bottom-4 opacity-10">
                <Ionicons name="star" size={100} color="#136ADA" />
              </View>
            </View>
          </View>
        )}

        {/* Teaching Classes Horizontal Section */}
        <View className="mb-8 mt-2">
          <View className="flex-row justify-between items-center px-6 mb-4">
            <Text
              style={{ fontFamily: "Poppins-SemiBold" }}
              className="text-gray-500 text-xs mb-0 uppercase tracking-widest"
            >
              Lớp học giảng dạy
            </Text>
            <TouchableOpacity onPress={() => router.push("/teacher/my-class")}>
              <Text
                className="text-[#136ADA] text-sm"
                style={{ fontFamily: "Poppins-Medium" }}
              >
                Tất cả
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={teachingClasses}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: `/teacher/my-class/${item.classYearId}`,
                    params: {
                      subjectId: item.subjectId,
                      subjectName: item.subjectName,
                    },
                  } as any)
                }
                className="bg-[#136ADA] w-64 p-6 rounded-[32px] shadow-lg shadow-blue-100"
              >
                <View className="flex-row justify-between items-start mb-6">
                  <View className="flex-row items-center gap-3">
                    <View className="bg-white/20 p-2 rounded-xl">
                      <Ionicons name="school-outline" size={22} color="white" />
                    </View>
                    <View>
                      <Text
                        className="text-white text-lg"
                        style={{ fontFamily: "Poppins-Bold" }}
                      >
                        {item.className}
                      </Text>
                      <Text
                        className="text-white/80 text-[10px]"
                        style={{ fontFamily: "Poppins-Medium" }}
                      >
                        {item.subjectName} • Khối {item.grade}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row items-center justify-between mt-2">
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="people-outline" size={14} color="white" />
                    <Text
                      className="text-white text-xs"
                      style={{ fontFamily: "Poppins-Bold" }}
                    >
                      {item.studentCount || "40"}
                    </Text>
                    <Text
                      className="text-white/70 text-[10px]"
                      style={{ fontFamily: "Poppins-Regular" }}
                    >
                      Học sinh
                    </Text>
                  </View>
                  <View className="bg-white/20 px-3 py-1.5 rounded-xl">
                    <Ionicons name="arrow-forward" size={16} color="white" />
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.classYearId.toString()}
            ListEmptyComponent={() => (
              <View className="w-64 bg-gray-50 border border-gray-100 p-5 rounded-[32px] items-center justify-center">
                <Ionicons name="school-outline" size={32} color="#CCC" />
                <Text
                  className="text-gray-400 mt-2 text-xs"
                  style={{ fontFamily: "Poppins-Medium" }}
                >
                  Chưa có lớp giảng dạy
                </Text>
              </View>
            )}
          />
        </View>

        {/* Teaching Activities Section (Service Grid) */}
        <View className="px-6 mb-8 mt-2">
          <Text
            style={{ fontFamily: "Poppins-SemiBold" }}
            className="text-gray-500 text-xs mb-3 uppercase tracking-widest"
          >
            Tiện ích Nghiệp vụ
          </Text>
          <View className="flex-row flex-wrap justify-between gap-y-4">
            <TeachingCard
              icon="calendar"
              label="Lịch dạy"
              route="/teacher/schedules"
              color="bg-teal-100"
              iconColor="#14B8A6"
            />
            <TeachingCard
              icon="library"
              label="Khóa học"
              route="/teacher/courses"
              color="bg-orange-100"
              iconColor="#F97316"
            />
            <TeachingCard
              icon="time"
              label="Lịch thi"
              route="/teacher/exam-schedules"
              color="bg-rose-100"
              iconColor="#F43F5E"
            />
            <TeachingCard
              icon="megaphone"
              label="Sự kiện"
              route="/teacher/events"
              color="bg-amber-100"
              iconColor="#D97706"
            />
            <TeachingCard
              icon="people"
              label="Đồng nghiệp"
              route="/teacher/community/teachers"
              color="bg-indigo-100"
              iconColor="#6366F1"
            />
          </View>
        </View>

        {/* Bottom Banner Redesigned */}
        <View className="px-6 pb-12 mt-2">
          <View className="bg-white border border-gray-100 rounded-[40px] p-6 shadow-sm overflow-hidden min-h-[160px] relative">
            <View
              className="absolute right-[-10] top-5 w-32 h-32 bg-teal-500/5 rounded-full"
              style={{ transform: [{ scale: 1.5 }] }}
            />

            <View className="z-10 flex-1 justify-between">
              <View>
                <Text
                  className="text-[#14B8A6] text-sm mb-1"
                  style={{ fontFamily: "Poppins-Bold" }}
                >
                  Thông báo mới
                </Text>
                <Text
                  className="text-gray-800 leading-snug"
                  style={{ fontFamily: "Poppins-SemiBold", fontSize: 18 }}
                  numberOfLines={2}
                >
                  Kiểm tra các bài nộp còn thiếu từ học sinh trong tuần này.
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/teacher/notifications" as any)}
                className="bg-teal-50 self-start px-5 py-2 rounded-xl mt-4"
              >
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-[#14B8A6] text-[10px] uppercase tracking-widest"
                >
                  Kiểm tra ngay
                </Text>
              </TouchableOpacity>
            </View>

            <View className="absolute right-4 bottom-4 opacity-10">
              <Ionicons name="notifications" size={60} color="#14B8A6" />
            </View>
          </View>
        </View>
      </ScrollView>
      <SideMenu visible={isMenuVisible} onClose={() => setMenuVisible(false)} />
    </AdminPageWrapper>
  );
}
// --- Helper Components ---

function HomeroomAction({
  icon,
  label,
  route,
  disabled,
  loading,
}: {
  icon: string;
  label: string;
  route: string;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={() => !disabled && !loading && router.push(route as any)}
      className={`items-center gap-1.5 ${disabled ? "opacity-30" : ""}`}
    >
      <View className="w-10 h-10 bg-white/20 rounded-2xl items-center justify-center">
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Ionicons name={icon as any} size={16} color="white" />
        )}
      </View>
      <Text
        style={{ fontFamily: "Poppins-SemiBold" }}
        className="text-white text-[9px]"
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function TeachingCard({
  icon,
  label,
  route,
  color,
  iconColor,
}: {
  icon: string;
  label: string;
  route: string;
  color: string;
  iconColor: string;
}) {
  return (
    <TouchableOpacity
      onPress={() => router.push(route as any)}
      className={`${color} w-[31%] py-6 rounded-2xl items-center justify-center gap-2`}
    >
      <View className="w-10 h-10 bg-white/50 rounded-full items-center justify-center">
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <Text
        style={{ fontFamily: "Poppins-Medium" }}
        className="text-black text-xs text-center"
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
