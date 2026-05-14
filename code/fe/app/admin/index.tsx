import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AdminPageWrapper } from "../../components/ui/AdminPageWrapper";
import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../../store/authStore";
import { useConfigStore } from "../../store/configStore";
import SideMenu from "../../components/SideMenu";
import { dashboardService } from "../../services/dashboard.service";
import { DashboardStats } from "../../types/dashboard";

import { reportGenerator } from "../../utils/reportGenerator";

export default function AdminDashboard() {
  const router = useRouter();
  const { userInfo } = useAuthStore();
  const { schoolYear } = useConfigStore();
  const adminName = userInfo?.fullName?.split(" ").at(-1) ?? "Quản trị viên";

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats(Number(schoolYear));
      setStats(data);
    } catch (err) {
      console.log("Error fetching admin stats:", err);
    } finally {
      setLoading(false);
    }
  }, [schoolYear]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const handleCreateReport = async () => {
    if (!stats) return;
    try {
      setIsGeneratingReport(true);
      await reportGenerator.generateAdminReport(stats, Number(schoolYear));
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo báo cáo PDF");
    } finally {
      setIsGeneratingReport(false);
    }
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
    {
      label: "AI Chat",
      icon: "sparkles-outline",
      color: "bg-emerald-100",
      iconColor: "#059669",
      route: "/admin/ai-chat",
    },
    {
      label: "Tin nhắn",
      icon: "chatbubbles-outline",
      color: "bg-cyan-100",
      iconColor: "#06B6D4",
      route: "/admin/chat",
    },
  ];

  const STAT_CARDS = [
    {
      label: "Học sinh",
      value: stats?.totalStudents || 0,
      icon: "people",
      color: "#136ADA",
      bg: "bg-blue-50",
    },
    {
      label: "Giáo viên",
      value: stats?.totalTeachers || 0,
      icon: "person",
      color: "#A855F7",
      bg: "bg-purple-50",
    },
    {
      label: "Lớp học",
      value: stats?.totalClasses || 0,
      icon: "school",
      color: "#14B8A6",
      bg: "bg-teal-50",
    },
    {
      label: "Môn học",
      value: stats?.totalSubjects || 0,
      icon: "book",
      color: "#F97316",
      bg: "bg-orange-50",
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

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

        {/* Finance & Performance Section */}
        {stats && (
          <View className="px-6 mb-6">
            <Text
              style={{ fontFamily: "Poppins-SemiBold" }}
              className="text-gray-500 text-xs mb-3 uppercase tracking-widest"
            >
              Tài chính & Hiệu suất
            </Text>

            {/* Revenue Card */}
            <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text
                  style={{ fontFamily: "Poppins-SemiBold" }}
                  className="text-gray-800 text-sm"
                >
                  Doanh thu học phí
                </Text>
                <Ionicons name="cash-outline" size={20} color="#F97316" />
              </View>

              <View className="flex-row items-end justify-between mb-2">
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-2xl text-orange-600"
                >
                  {formatCurrency(stats.finance.totalCollectedRevenue)}
                </Text>
                <Text
                  style={{ fontFamily: "Poppins-Regular" }}
                  className="text-gray-400 text-[10px]"
                >
                  / {formatCurrency(stats.finance.totalExpectedRevenue)}
                </Text>
              </View>

              {/* Progress Bar */}
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                <View
                  className="h-full bg-orange-500"
                  style={{
                    width: `${(stats.finance.totalCollectedRevenue / stats.finance.totalExpectedRevenue) * 100 || 0}%`,
                  }}
                />
              </View>

              <View className="flex-row justify-between">
                <View>
                  <Text
                    style={{ fontFamily: "Poppins-Regular" }}
                    className="text-gray-400 text-[10px]"
                  >
                    Cần thu
                  </Text>
                  <Text
                    style={{ fontFamily: "Poppins-Medium" }}
                    className="text-red-500 text-xs"
                  >
                    {formatCurrency(stats.finance.totalPendingRevenue)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text
                    style={{ fontFamily: "Poppins-Regular" }}
                    className="text-gray-400 text-[10px]"
                  >
                    Nợ phí
                  </Text>
                  <Text
                    style={{ fontFamily: "Poppins-Medium" }}
                    className="text-gray-800 text-xs"
                  >
                    {stats.finance.studentsWithOverdueFees} học sinh
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row gap-4">
              {/* Attendance Card */}
              <View className="flex-1 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <Text
                  style={{ fontFamily: "Poppins-SemiBold" }}
                  className="text-gray-400 text-[10px] uppercase"
                >
                  Chuyên cần
                </Text>
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-xl text-teal-600 mt-1"
                >
                  {stats.attendance.overallAttendanceRate}%
                </Text>
                <View className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                  <View
                    className="h-full bg-teal-500"
                    style={{
                      width: `${stats.attendance.overallAttendanceRate}%`,
                    }}
                  />
                </View>
              </View>

              {/* Academics Card */}
              <View className="flex-1 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <Text
                  style={{ fontFamily: "Poppins-SemiBold" }}
                  className="text-gray-400 text-[10px] uppercase"
                >
                  Bài tập
                </Text>
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-xl text-indigo-600 mt-1"
                >
                  {stats.academic.assignmentCompletionRate}%
                </Text>
                <View className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                  <View
                    className="h-full bg-indigo-500"
                    style={{
                      width: `${stats.academic.assignmentCompletionRate}%`,
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Recent Activities Section */}
        {stats && stats.recentActivities.length > 0 && (
          <View className="px-6 mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text
                style={{ fontFamily: "Poppins-SemiBold" }}
                className="text-gray-500 text-xs uppercase tracking-widest"
              >
                Hoạt động gần đây
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/admin/activities" as any)}
              >
                <Text
                  style={{ fontFamily: "Poppins-Medium" }}
                  className="text-orange-500 text-xs"
                >
                  Xem tất cả
                </Text>
              </TouchableOpacity>
            </View>
            <View className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
              {stats.recentActivities.slice(0, 3).map((activity, index) => (
                <View
                  key={index}
                  className={`flex-row items-center p-4 ${index !== Math.min(stats.recentActivities.length, 3) - 1 ? "border-b border-gray-50" : ""}`}
                >
                  <View
                    className={`w-10 h-10 rounded-2xl items-center justify-center mr-3 ${
                      activity.type === "Payment"
                        ? "bg-orange-50"
                        : activity.type === "Submission"
                          ? "bg-blue-50"
                          : "bg-gray-50"
                    }`}
                  >
                    <Ionicons
                      name={
                        activity.type === "Payment"
                          ? "cash-outline"
                          : activity.type === "Submission"
                            ? "document-text-outline"
                            : "notifications-outline"
                      }
                      size={20}
                      color={
                        activity.type === "Payment"
                          ? "#F97316"
                          : activity.type === "Submission"
                            ? "#3B82F6"
                            : "#6B7280"
                      }
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: "Poppins-Medium" }}
                      className="text-gray-800 text-xs"
                      numberOfLines={1}
                    >
                      {activity.description}
                    </Text>
                    <Text
                      style={{ fontFamily: "Poppins-Regular" }}
                      className="text-gray-400 text-[10px]"
                    >
                      {new Date(activity.time).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      - {new Date(activity.time).toLocaleDateString("vi-VN")}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

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

        {/* AI Chat Banner */}
        <View className="mx-6 mb-4 p-5 bg-emerald-500 rounded-3xl overflow-hidden shadow-lg shadow-emerald-200">
          <View className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-white text-base"
          >
            🤖 EduManage AI
          </Text>
          <Text
            style={{ fontFamily: "Poppins-Regular" }}
            className="text-white/80 text-xs mt-1"
          >
            Hỏi AI về trường học, upload tài liệu nội quy cho knowledge base.
          </Text>
          <TouchableOpacity
            className="bg-white/20 self-start px-4 py-1.5 rounded-full mt-4"
            onPress={() => router.push("/admin/ai-chat" as any)}
          >
            <Text
              style={{ fontFamily: "Poppins-SemiBold" }}
              className="text-white text-[10px]"
            >
              Mở AI Chat
            </Text>
          </TouchableOpacity>
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
            Xem xét kết quả học tập và điểm danh Học kỳ 1 năm học {schoolYear}.
          </Text>
          <TouchableOpacity
            className="bg-white/20 self-start px-4 py-1.5 rounded-full mt-4 flex-row items-center"
            onPress={handleCreateReport}
            disabled={isGeneratingReport}
          >
            {isGeneratingReport ? (
              <ActivityIndicator size="small" color="white" className="mr-2" />
            ) : null}
            <Text
              style={{ fontFamily: "Poppins-SemiBold" }}
              className="text-white text-[10px]"
            >
              {isGeneratingReport ? "Đang tạo..." : "Tạo báo cáo"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <SideMenu visible={isMenuVisible} onClose={() => setMenuVisible(false)} />
    </AdminPageWrapper>
  );
}
