import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";
import { examScheduleService } from "../../../services/examSchedule.service";
import {
  ExamScheduleResponse,
  ExamScheduleFilterRequest,
} from "../../../types/examSchedule";
import { PagedResponse } from "../../../types/common";

import { SCHOOL_YEAR, TERM } from "../../../constants/config";

const ExamScheduleIndex = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<PagedResponse<ExamScheduleResponse> | null>(
    null,
  );
  const [filter, setFilter] = useState<ExamScheduleFilterRequest>({
    pageNumber: 1,
    pageSize: 10,
    term: parseInt(TERM.toString(), 10),
    schoolYear: parseInt(SCHOOL_YEAR, 10),
  });

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchTitle, setSearchTitle] = useState("");
  // Temporary state for the modal inputs
  const [modalTerm, setModalTerm] = useState("");
  const [modalYear, setModalYear] = useState("");
  const [modalType, setModalType] = useState("");

  const fetchData = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const result = await examScheduleService.getAllSchedules(filter);
      setData(result);
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể tải lịch thi");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, [filter]);

  const openFilter = () => {
    setModalTerm(filter.term && filter.term > 0 ? filter.term.toString() : "");
    setModalYear(
      filter.schoolYear && filter.schoolYear > 0
        ? filter.schoolYear.toString()
        : "",
    );
    setModalType(filter.type || "");
    setIsFilterVisible(true);
  };

  const applySearch = () => {
    setFilter((prev) => ({
      ...prev,
      title: searchTitle.trim() || undefined,
      pageNumber: 1,
    }));
  };

  const applyFilters = () => {
    setFilter((prev) => ({
      ...prev,
      term: parseInt(modalTerm, 10) || undefined,
      schoolYear: parseInt(modalYear, 10) || undefined,
      type: modalType.trim() || undefined,
      pageNumber: 1,
    }));
    setIsFilterVisible(false);
  };

  const resetFilters = () => {
    setModalTerm(TERM.toString());
    setModalYear(SCHOOL_YEAR);
    setModalType("");
    setSearchTitle("");
    setFilter({
      pageNumber: 1,
      pageSize: 10,
      term: 0,
      schoolYear: 0,
    });
    setIsFilterVisible(false);
  };

  const handleDeleteSchedule = async (id: string, title: string) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa "${title}"? Thao tác này sẽ xóa vĩnh viễn tất cả các ca thi và phân công cho lịch thi này.`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const success = await examScheduleService.deleteSchedule(id);
              if (success) {
                Alert.alert("Thành công", "Đã xóa lịch thi thành công");
                fetchData();
              } else {
                Alert.alert("Lỗi", "Không thể xóa lịch thi");
              }
            } catch (error: any) {
              Alert.alert("Lỗi", error?.response?.data?.message || "Đã xảy ra lỗi");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };


  return (
    <AdminPageWrapper
      title="Lịch thi"
      rightComponent={
        <TouchableOpacity
          onPress={() => router.push("/admin/exam-schedules/create")}
          className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100"
        >
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#136ADA] text-xs">Thêm mới</Text>
        </TouchableOpacity>
      }
      searchProps={{
        value: searchTitle,
        onChangeText: setSearchTitle,
        placeholder: "Tìm kiếm môn thi...",
        onFilterPress: openFilter,
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Advanced Filter Modal */}
      <Modal
        visible={isFilterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[40px] px-8 py-10 shadow-2xl">
            <View className="flex-row justify-between items-center mb-10">
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-3xl text-black">Bộ lọc</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)} className="bg-gray-100 p-2 rounded-full">
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="mb-10">
              {/* Filter: Academic Term */}
              <View className="mb-8">
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-xs mb-3 ml-1">HỌC KỲ</Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setModalTerm("")}
                    className={`px-4 py-2 rounded-xl border ${modalTerm === "" ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
                  >
                    <Text style={{ fontFamily: "Poppins-Bold", fontSize: 11, color: modalTerm === "" ? "#1D4ED8" : "#9CA3AF" }}>
                      TẤT CẢ
                    </Text>
                  </TouchableOpacity>
                  {[1, 2].map(t => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setModalTerm(t.toString())}
                      className={`px-4 py-2 rounded-xl border ${modalTerm === t.toString() ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
                    >
                      <Text style={{ fontFamily: "Poppins-Bold", fontSize: 11, color: modalTerm === t.toString() ? "#1D4ED8" : "#9CA3AF" }}>
                        HỌC KỲ {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filter: Exam Type */}
              <View className="mb-8">
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-xs mb-3 ml-1">LOẠI KỲ THI</Text>
                <View className="flex-row flex-wrap gap-2">
                  <TouchableOpacity
                    onPress={() => setModalType("")}
                    className={`px-4 py-2 rounded-xl border ${modalType === "" ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
                  >
                    <Text style={{ fontFamily: "Poppins-Bold", fontSize: 11, color: modalType === "" ? "#1D4ED8" : "#9CA3AF" }}>
                      TẤT CẢ
                    </Text>
                  </TouchableOpacity>
                  {["Giữa Kì", "Cuối Kì"].map(type => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setModalType(type)}
                      className={`px-4 py-2 rounded-xl border ${modalType === type ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
                    >
                      <Text style={{ fontFamily: "Poppins-Bold", fontSize: 11, color: modalType === type ? "#1D4ED8" : "#9CA3AF" }}>
                        {type.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filter: School Year */}
              <View className="mb-4">
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-xs mb-3 ml-1">NĂM HỌC</Text>
                <View className="flex-row flex-wrap gap-2">
                  <TouchableOpacity
                    onPress={() => setModalYear("")}
                    className={`px-4 py-2 rounded-xl border ${modalYear === "" ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
                  >
                    <Text style={{ fontFamily: "Poppins-Bold", fontSize: 11, color: modalYear === "" ? "#1D4ED8" : "#9CA3AF" }}>
                      TẤT CẢ
                    </Text>
                  </TouchableOpacity>
                  {["2024", "2025", "2026"].map(y => (
                    <TouchableOpacity
                      key={y}
                      onPress={() => setModalYear(y)}
                      className={`px-4 py-2 rounded-xl border ${modalYear === y ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
                    >
                      <Text style={{ fontFamily: "Poppins-Bold", fontSize: 11, color: modalYear === y ? "#1D4ED8" : "#9CA3AF" }}>
                        {y}
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
                <Text style={{ fontFamily: "Poppins-Bold", fontSize: 15 }} className="text-gray-400">Thiết lập lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyFilters}
                className="flex-1 bg-[#136ADA] h-16 rounded-[22px] items-center justify-center shadow-lg shadow-blue-200"
              >
                <Text style={{ fontFamily: "Poppins-Bold", fontSize: 15 }} className="text-white">Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Standardized Exam Schedule List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={data?.items || []}
          keyExtractor={(item) => item.examScheduleId}
          className="bg-white"
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, gap: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#136ADA" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100"
              onPress={() =>
                router.push({
                  pathname: "/admin/exam-schedules/[id]",
                  params: { id: item.examScheduleId, title: item.title },
                })
              }
            >
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <Text style={{ fontFamily: "Poppins-Bold", fontSize: 16 }} className="text-black mb-1">
                    {item.title}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-1.5 flex-wrap">
                    <View className="bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                      <Text style={{ fontFamily: "Poppins-Bold", fontSize: 10, color: "#136ADA" }}>HỌC KỲ {item.term}</Text>
                    </View>
                    <View className={`px-2.5 py-1 rounded-xl border ${item.isActive ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                      <Text style={{ fontFamily: "Poppins-Bold", fontSize: 10, color: item.isActive ? "#16A34A" : "#9CA3AF" }}>
                        {item.isActive ? "ĐANG HOẠT ĐỘNG" : "KHÔNG HOẠT ĐỘNG"}
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="w-12 h-12 rounded-2xl bg-indigo-50 items-center justify-center border border-indigo-100">
                  <Ionicons name="document-text-outline" size={24} color="#6366F1" />
                </View>
              </View>

              <View className="flex-row items-center justify-between pt-3 border-t border-gray-50/50">
                <View className="flex-row items-center gap-2">
                  <Text style={{ fontFamily: "Poppins-Medium", fontSize: 11 }} className="text-gray-400">
                    Khối {item.grade} • {item.schoolYear}
                  </Text>
                </View>
                <View className="flex-row items-center gap-3">
                   <TouchableOpacity onPress={() => handleDeleteSchedule(item.examScheduleId, item.title)}>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                   </TouchableOpacity>
                   <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200 mx-6">
              <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-4 text-center px-10">
                Không tìm thấy lịch thi nào.{"\n"}Chạm (+) để tạo mới.
              </Text>
            </View>
          }
          ListFooterComponent={<View className="h-20 bg-white" />}
        />
      )}
    </AdminPageWrapper>
  );
};

export default ExamScheduleIndex;
