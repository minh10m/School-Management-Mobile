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
import { useRouter, Stack } from "expo-router";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";
import { useState, useEffect, useCallback } from "react";
import { courseService } from "../../../services/course.service";
import { subjectService } from "../../../services/subject.service";
import { CourseResponse } from "../../../types/course";
import { SubjectResponse } from "../../../types/subject";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CourseResponse | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // New Filters
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>();
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);

  // Local Modal States
  const [tempSearch, setTempSearch] = useState("");
  const [tempStatus, setTempStatus] = useState("all");
  const [tempSubjectId, setTempSubjectId] = useState<string | undefined>();
  const [tempMinPrice, setTempMinPrice] = useState<string>("");
  const [tempMaxPrice, setTempMaxPrice] = useState<string>("");

  const fetchInitialData = async () => {
    try {
      const subList = await subjectService.getSubjects();
      setSubjects(subList);
    } catch (err) {
      console.error("Error fetching initial data:", err);
    }
  };

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await courseService.getAllCourseForAdmin({
        status: activeTab === "all" ? undefined : activeTab,
        courseName: search || undefined,
        subjectId: selectedSubjectId,
        minPrice: minPrice,
        maxPrice: maxPrice,
        pageSize: 50,
        pageNumber: 1,
      });
      setCourses(res.items || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, search, selectedSubjectId, minPrice, maxPrice]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  const openFilter = () => {
    setTempSearch(search);
    setTempStatus(activeTab);
    setTempSubjectId(selectedSubjectId);
    setTempMinPrice(minPrice?.toString() || "");
    setTempMaxPrice(maxPrice?.toString() || "");
    setIsFilterVisible(true);
  };

  const applyFilters = () => {
    setSearch(tempSearch);
    setActiveTab(tempStatus);
    setSelectedSubjectId(tempSubjectId);
    setMinPrice(tempMinPrice ? parseFloat(tempMinPrice) : undefined);
    setMaxPrice(tempMaxPrice ? parseFloat(tempMaxPrice) : undefined);
    setIsFilterVisible(false);
  };

  const resetFilters = () => {
    setTempSearch("");
    setTempStatus("all");
    setTempSubjectId(undefined);
    setTempMinPrice("");
    setTempMaxPrice("");
    
    setSearch("");
    setActiveTab("all");
    setSelectedSubjectId(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setIsFilterVisible(false);
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

  const confirmAction = (action: "Approved" | "Rejected") => {
    if (!selected) return;
    Alert.alert(
      action === "Approved" ? "Duyệt khóa học" : "Từ chối khóa học",
      `Bạn có chắc chắn muốn ${action === "Approved" ? "duyệt" : "từ chối"} khóa học "${selected.courseName}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: action === "Approved" ? "Duyệt" : "Từ chối",
          style: action === "Rejected" ? "destructive" : "default",
          onPress: () => handleUpdateStatus(selected.id, action),
        },
      ]
    );
  };

  return (
    <AdminPageWrapper
      title="Quản lý Khóa học"
      searchProps={{
        value: search,
        onChangeText: setSearch,
        placeholder: "Tìm tên khóa học...",
        onFilterPress: openFilter,
      }}
    >

      {/* Filter Modal */}
      <Modal
        visible={isFilterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[40px] px-8 py-10 shadow-2xl">
            <View className="flex-row justify-between items-center mb-10">
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-3xl text-black"
              >
                Bộ lọc
              </Text>
              <TouchableOpacity
                onPress={() => setIsFilterVisible(false)}
                className="bg-white p-2 rounded-full border border-gray-100"
              >
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="mb-10">
              {/* Filter: Subject */}
              <View className="mb-6">
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-xs mb-3 ml-1">MÔN HỌC</Text>
                <View className="flex-row flex-wrap gap-2">
                  <TouchableOpacity
                    onPress={() => setTempSubjectId(undefined)}
                    className={`px-4 py-2 rounded-xl border ${!tempSubjectId ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
                  >
                    <Text style={{ fontFamily: "Poppins-Bold", fontSize: 11, color: !tempSubjectId ? "#1D4ED8" : "#9CA3AF" }}>TẤT CẢ</Text>
                  </TouchableOpacity>
                  {subjects.map((sub) => (
                    <TouchableOpacity
                      key={sub.subjectId}
                      onPress={() => setTempSubjectId(sub.subjectId)}
                      className={`px-4 py-2 rounded-xl border ${tempSubjectId === sub.subjectId ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
                    >
                      <Text style={{ fontFamily: "Poppins-Bold", fontSize: 11, color: tempSubjectId === sub.subjectId ? "#1D4ED8" : "#9CA3AF" }}>
                        {sub.subjectName.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filter: Price Range */}
              <View className="mb-6">
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-xs mb-3 ml-1">KHOẢNG GIÁ (VNĐ)</Text>
                <View className="flex-row items-center gap-3">
                  <View className="flex-1 bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100">
                    <TextInput
                      placeholder="Từ"
                      keyboardType="numeric"
                      className="text-black text-sm"
                      style={{ fontFamily: "Poppins-Regular" }}
                      value={tempMinPrice}
                      onChangeText={setTempMinPrice}
                    />
                  </View>
                  <View className="w-4 h-[1px] bg-gray-200" />
                  <View className="flex-1 bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100">
                    <TextInput
                      placeholder="Đến"
                      keyboardType="numeric"
                      className="text-black text-sm"
                      style={{ fontFamily: "Poppins-Regular" }}
                      value={tempMaxPrice}
                      onChangeText={setTempMaxPrice}
                    />
                  </View>
                </View>
              </View>

              {/* Filter: Status */}
              <View className="mb-4">
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-xs mb-3 ml-1">TRẠNG THÁI</Text>
                <View className="flex-row flex-wrap gap-2">
                  {TABS.map((tab) => (
                    <TouchableOpacity
                      key={tab.id}
                      onPress={() => setTempStatus(tab.id)}
                      className={`px-4 py-2 rounded-xl border ${tempStatus === tab.id ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
                    >
                      <Text style={{ fontFamily: "Poppins-Bold", fontSize: 11, color: tempStatus === tab.id ? "#1D4ED8" : "#9CA3AF" }}>
                        {tab.label.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Modal Buttons */}
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={resetFilters}
                className="flex-1 bg-gray-50 h-16 rounded-[22px] items-center justify-center"
              >
                <Text
                  style={{ fontFamily: "Poppins-Bold", fontSize: 15 }}
                  className="text-gray-400"
                >
                  Thiết lập lại
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyFilters}
                className="flex-1 bg-[#136ADA] h-16 rounded-[22px] items-center justify-center shadow-lg shadow-blue-200"
              >
                <Text
                  style={{ fontFamily: "Poppins-Bold", fontSize: 15 }}
                  className="text-white"
                >
                  Áp dụng
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Courses List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 150 }}
          className="bg-white"
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
    </AdminPageWrapper>
  );
}
