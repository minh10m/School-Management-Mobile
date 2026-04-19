import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AdminPageWrapper } from "../../components/ui/AdminPageWrapper";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useCallback } from "react";
import { authService } from "../../services/auth.service";
import { studentService } from "../../services/student.service";
import { teacherService } from "../../services/teacher.service";
import { classYearService } from "../../services/classYear.service";
import { useAuthStore } from "../../store/authStore";
import { useConfigStore } from "../../store/configStore";
import SideMenu from "../../components/SideMenu";

export default function AdminDashboard() {
  const router = useRouter();
  const { userInfo } = useAuthStore();
  const { schoolYear } = useConfigStore();
  const adminName = userInfo?.fullName?.split(" ").at(-1) ?? "Quản trị viên";

  const [stats, setStats] = useState({
    students: "0",
    teachers: "0",
    classes: "0",
    fees: "0",
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMenuVisible, setMenuVisible] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const [stuRes, teaRes, claRes] = await Promise.all([
        studentService.getStudents({ PageSize: 1 }),
        teacherService.getTeachers({ PageSize: 1 }),
        classYearService.getClassYears({ schoolYear: schoolYear.toString() }),
      ]);
      setStats({
        students:
          (stuRes as any).totalCount?.toString() ||
          (stuRes as any).length?.toString() ||
          "0",
        teachers:
          (teaRes as any).totalCount?.toString() ||
          (teaRes as any).length?.toString() ||
          "0",
        classes: claRes.length?.toString() || "0",
        fees: "12", // Mock for now
      });
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, schoolYear]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const QUICK_ACTIONS = [
    {
      label: "Người dùng",
      icon: "people-outline",
      color: "bg-blue-100",
      iconColor: "#136ADA",
      route: "/admin/users",
    },
    {
      label: "Vai trò",
      icon: "shield-outline",
      color: "bg-purple-100",
      iconColor: "#A855F7",
      route: "/admin/roles",
    },
    {
      label: "Học sinh",
      icon: "school-outline",
      color: "bg-blue-50",
      iconColor: "#0ea5e9",
      route: "/admin/students",
    },
    {
      label: "Giáo viên",
      icon: "person-circle-outline",
      color: "bg-indigo-100",
      iconColor: "#6366F1",
      route: "/admin/teachers",
    },
    {
      label: "Lớp học",
      icon: "business-outline",
      color: "bg-teal-100",
      iconColor: "#14B8A6",
      route: "/admin/class-years",
    },
    {
      label: "Môn học",
      icon: "book-outline",
      color: "bg-green-100",
      iconColor: "#22C55E",
      route: "/admin/subjects",
    },
    {
      label: "Lịch học",
      icon: "calendar-outline",
      color: "bg-amber-100",
      iconColor: "#D97706",
      route: "/admin/schedules",
    },
    {
      label: "Lịch thi",
      icon: "document-text-outline",
      color: "bg-yellow-100",
      iconColor: "#EAB308",
      route: "/admin/exam-schedules",
    },
    {
      label: "Học phí",
      icon: "cash-outline",
      color: "bg-orange-100",
      iconColor: "#F97316",
      route: "/admin/fees",
    },
    {
      label: "Sự kiện",
      icon: "megaphone-outline",
      color: "bg-pink-100",
      iconColor: "#F43F5E",
      route: "/admin/events",
    },
    {
      label: "Khóa học",
      icon: "journal-outline",
      color: "bg-rose-100",
      iconColor: "#E11D48",
      route: "/admin/courses",
    },
  ];

  const STAT_CARDS = [
    {
      label: "Học sinh",
      value: stats.students,
      icon: "people",
      color: "#136ADA",
      bg: "bg-blue-50",
    },
    {
      label: "Giáo viên",
      value: stats.teachers,
      icon: "person",
      color: "#A855F7",
      bg: "bg-purple-50",
    },
    {
      label: "Lớp học",
      value: stats.classes,
      icon: "school",
      color: "#14B8A6",
      bg: "bg-teal-50",
    },
    {
      label: "Học phí",
      value: stats.fees,
      icon: "cash",
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
          onPress={() => router.push("/admin/notifications" as any)}
        >
          <Ionicons name="notifications-outline" size={28} color="black" />
        </TouchableOpacity>
      }
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Greeting */}
        <View className="px-6 mt-6 mb-2">
          <Text
            style={{ fontFamily: "Poppins-SemiBold" }}
            className="text-black text-xl"
          >
            Chào mừng bạn, {adminName} 👋
          </Text>
          <Text
            style={{ fontFamily: "Poppins-Regular" }}
            className="text-gray-400 text-xs"
          >
            Bảng điều khiển cho Năm học {schoolYear}
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="px-6 mt-6 mb-5">
          <Text
            style={{ fontFamily: "Poppins-SemiBold" }}
            className="text-gray-500 text-xs mb-3 uppercase tracking-widest"
          >
            Tổng quan chung
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {STAT_CARDS.map((s) => (
              <View
                key={s.label}
                className={`${s.bg} flex-1 min-w-[44%] rounded-3xl p-5`}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="w-8 h-8 rounded-full bg-white/60 items-center justify-center">
                    <Ionicons name={s.icon as any} size={18} color={s.color} />
                  </View>
                  {loading && !refreshing ? (
                    <ActivityIndicator size="small" color={s.color} />
                  ) : (
                    <Text
                      style={{ fontFamily: "Poppins-Bold", color: s.color }}
                      className="text-2xl"
                    >
                      {s.value}
                    </Text>
                  )}
                </View>
                <Text
                  style={{ fontFamily: "Poppins-Medium" }}
                  className="text-gray-600/80 text-xs"
                >
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-5">
          <Text
            style={{ fontFamily: "Poppins-SemiBold" }}
            className="text-gray-500 text-xs mb-3 uppercase tracking-widest"
          >
            Quản lý hệ thống
          </Text>
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                className={`${action.color} w-[31%] py-6 rounded-2xl items-center justify-center gap-2`}
                onPress={() => router.push(action.route as any)}
              >
                <View className="w-10 h-10 bg-white/50 rounded-full items-center justify-center">
                  <Ionicons
                    name={action.icon as any}
                    size={20}
                    color={action.iconColor}
                  />
                </View>
                <Text
                  style={{ fontFamily: "Poppins-Medium" }}
                  className="text-black text-xs text-center"
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Banner/Note */}
        <View className="mx-6 mb-10 p-5 bg-indigo-500 rounded-3xl overflow-hidden shadow-lg shadow-indigo-200">
          <View className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-white text-base"
          >
            Báo cáo nhanh
          </Text>
          <Text
            style={{ fontFamily: "Poppins-Regular" }}
            className="text-white/80 text-xs mt-1"
          >
            Xem xét kết quả học tập và điểm danh Học kỳ 1.
          </Text>
          <TouchableOpacity className="bg-white/20 self-start px-4 py-1.5 rounded-full mt-4">
            <Text
              style={{ fontFamily: "Poppins-SemiBold" }}
              className="text-white text-[10px]"
            >
              Tạo báo cáo
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <SideMenu visible={isMenuVisible} onClose={() => setMenuVisible(false)} />
    </AdminPageWrapper>
  );
}
