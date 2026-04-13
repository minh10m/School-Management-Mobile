import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { courseService } from "../../../services/course.service";
import { CourseResponse } from "../../../types/course";
import { StatusBar } from "expo-status-bar";

type Status = "pending" | "approved" | "rejected";

const STATUS_CONFIG: Record<
  Status,
  { bg: string; text: string; label: string; icon: string }
> = {
  pending: {
    bg: "#FFF7ED",
    text: "#F97316",
    label: "Chờ duyệt",
    icon: "time-outline",
  },
  approved: {
    bg: "#F0FDF4",
    text: "#22C55E",
    label: "Đã duyệt",
    icon: "checkmark-circle-outline",
  },
  rejected: {
    bg: "#FEF2F2",
    text: "#EF4444",
    label: "Từ chối",
    icon: "close-circle-outline",
  },
};

const TABS: { id: string; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ duyệt" },
  { id: "approved", label: "Đã duyệt" },
  { id: "rejected", label: "Từ chối" },
];

export default function AdminCoursesScreen() {
  const [activeTab, setActiveTab] = useState("all");
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CourseResponse | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await courseService.getAllCourseForAdmin({
        status: activeTab === "all" ? undefined : activeTab,
        courseName: search || undefined,
        pageSize: 50,
        pageNumber: 1,
      });
      setCourses(res.items || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      // Fallback if API fails or is not ready
      setCourses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  const handleUpdateStatus = async (courseId: string, newStatus: string) => {
    try {
      setLoading(true);
      await courseService.updateCourseStatus(courseId, { status: newStatus });
      Alert.alert("Thành công", "Đã cập nhật trạng thái khóa học.");
      setSelected(null);
      fetchCourses();
    } catch (err: any) {
      Alert.alert("Lỗi", err.response?.data?.message || "Không thể cập nhật trạng thái.");
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = (action: "approved" | "rejected") => {
    if (!selected) return;
    Alert.alert(
      action === "approved" ? "Duyệt khóa học" : "Từ chối khóa học",
      `Bạn có chắc chắn muốn ${action === "approved" ? "duyệt" : "từ chối"} khóa học "${selected.courseName}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: action === "approved" ? "Duyệt" : "Từ chối",
          style: action === "rejected" ? "destructive" : "default",
          onPress: () => handleUpdateStatus(selected.id, action),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar hidden />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-xl text-black">
            Quản lý Khóa học
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-6 py-4 bg-white">
        <View className="bg-gray-50 flex-row items-center px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm shadow-gray-100">
          <Ionicons name="search-outline" size={20} color="#9ca3af" />
          <TextInput
            placeholder="Tìm tên khóa học..."
            className="flex-1 ml-2 text-black text-sm"
            style={{ fontFamily: "Poppins-Regular" }}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={fetchCourses}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="bg-white pb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-full border ${activeTab === tab.id ? "bg-[#136ADA] border-[#136ADA]" : "bg-white border-gray-100"}`}
            >
              <Text
                style={{
                  fontFamily: "Poppins-Bold",
                  fontSize: 12,
                  color: activeTab === tab.id ? "white" : "#9CA3AF",
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing && courses.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 150 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#136ADA"
            />
          }
          renderItem={({ item }) => {
            const statusKey = item.status.toLowerCase() as Status;
            const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-sm"
                onPress={() => router.push(`/admin/courses/${item.id}` as any)}
              >
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1 pr-4">
                    <View className="flex-row items-center gap-2 mb-2">
                       <View className={`${cfg.bg} px-3 py-1 rounded-full flex-row items-center gap-1`}>
                          <Ionicons name={cfg.icon as any} size={12} color={cfg.text} />
                          <Text style={{ fontFamily: "Poppins-Bold", color: cfg.text, fontSize: 9 }}>
                            {cfg.label.toUpperCase()}
                          </Text>
                       </View>
                       <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-300 text-[10px]">
                          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                       </Text>
                    </View>
                    <Text
                      numberOfLines={2}
                      className="text-black text-base leading-6"
                      style={{ fontFamily: "Poppins-Bold" }}
                    >
                      {item.courseName}
                    </Text>
                  </View>
                  <View className="w-12 h-12 bg-blue-50/50 rounded-2xl items-center justify-center border border-blue-100/50">
                    <Ionicons name="journal-outline" size={24} color="#136ADA" />
                  </View>
                </View>

                <View className="flex-row items-center justify-between pt-4 border-t border-gray-50">
                  <View>
                    <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px] mb-1">CHUYÊN MÔN</Text>
                    <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-700 text-xs">
                       {item.subjectName} · {item.teacherName}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px] mb-1">HỌC PHÍ</Text>
                    <Text style={{ fontFamily: "Poppins-Bold" }} className="text-blue-600 text-sm">
                       {fmt(item.price)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-20">
              <View className="bg-gray-50 w-20 h-20 rounded-full items-center justify-center mb-6">
                 <Ionicons name="folder-open-outline" size={40} color="#D1D5DB" />
              </View>
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-600 text-lg mb-2">Trống</Text>
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-center px-10 text-xs">
                Không tìm thấy khóa học nào phù hợp với bộ lọc hiện tại.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
