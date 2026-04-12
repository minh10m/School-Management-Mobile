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
import { useRouter } from "expo-router";
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
    term: 0, // Set to 0 to fetch all (Backend logic: skip filter if <= 0)
    schoolYear: 0, // Set to 0 to fetch all (Backend logic: skip filter if <= 0)
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

  const renderItem = ({ item }: { item: ExamScheduleResponse }) => (
    <View
      className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100 flex-row items-center"
    >
      <TouchableOpacity
        activeOpacity={0.7}
        className="flex-1 flex-row items-center"
        onPress={() =>
          router.push({
            pathname: "/admin/exam-schedules/[id]",
            params: { id: item.examScheduleId, title: item.title },
          })
        }
      >
        <View
          className={`w-14 h-14 rounded-2xl items-center justify-center ${
            item.isActive ? "bg-blue-50" : "bg-gray-50"
          }`}
        >
          <Ionicons
            name="calendar"
            size={28}
            color={item.isActive ? "#136ADA" : "#9ca3af"}
          />
        </View>

        <View className="flex-1 ml-4">
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-gray-900 text-base mb-1"
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <View className="flex-row items-center">
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-500 text-xs"
            >
              Khối {item.grade} • Học kỳ {item.term} • {item.schoolYear}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <View className="items-end ml-4">
        <View
          className={`px-3 py-1 rounded-full ${
            item.isActive ? "bg-green-50" : "bg-gray-100"
          }`}
        >
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className={`text-[10px] ${
              item.isActive ? "text-green-600" : "text-gray-500"
            }`}
          >
            {item.isActive ? "ĐANG HOẠT ĐỘNG" : "KHÔNG HOẠT ĐỘNG"}
          </Text>
        </View>
        <View className="flex-row items-center mt-4">
          <TouchableOpacity
            onPress={() => handleDeleteSchedule(item.examScheduleId, item.title)}
            className="p-1"
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#D1D5DB"
            style={{ marginLeft: 8 }}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Main Header */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-50">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-xl text-black"
          >
            Lịch thi
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/admin/exam-schedules/create")}
          className="p-1"
        >
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-[#136ADA] text-base"
          >
            Tạo mới
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar Section */}
      <View className="px-6 py-4 flex-row items-center gap-x-4 bg-white border-b border-gray-50">
        <View className="flex-1 bg-gray-50 flex-row items-center px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm shadow-gray-100">
          <Ionicons name="search-outline" size={20} color="#9ca3af" />
          <TextInput
            placeholder="Tìm theo tiêu đề..."
            className="flex-1 ml-2 text-black text-sm"
            style={{ fontFamily: "Poppins-Regular" }}
            placeholderTextColor="#9ca3af"
            value={searchTitle}
            onChangeText={setSearchTitle}
            onSubmitEditing={applySearch}
          />
        </View>
        <TouchableOpacity
          onPress={openFilter}
          activeOpacity={0.7}
          className="bg-blue-50 w-11 h-11 rounded-2xl items-center justify-center border border-blue-100"
        >
          <Ionicons name="options-outline" size={22} color="#136ADA" />
        </TouchableOpacity>
      </View>

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
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-3xl text-black">Lọc Lịch thi</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)} className="bg-gray-100 p-2 rounded-full">
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Filter: Academic Term */}
            <View className="mb-8">
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-sm mb-4 ml-1">Học kỳ</Text>
              <View className="flex-row items-center gap-3">
                 {[1, 2].map(t => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setModalTerm(t.toString())}
                      className={`px-6 py-3.5 rounded-2xl items-center ${modalTerm === t.toString() ? "bg-[#DBEAFE]" : "bg-gray-50"}`}
                    >
                      <Text style={{ fontFamily: "Poppins-Bold", fontSize: 13, color: modalTerm === t.toString() ? "#1D4ED8" : "#9CA3AF" }}>Kỳ {t}</Text>
                    </TouchableOpacity>
                 ))}
                 <TouchableOpacity
                      onPress={() => setModalTerm("")}
                      className={`px-6 py-3.5 rounded-2xl items-center ${modalTerm === "" ? "bg-[#DBEAFE]" : "bg-gray-50"}`}
                    >
                      <Text style={{ fontFamily: "Poppins-Bold", fontSize: 13, color: modalTerm === "" ? "#1D4ED8" : "#9CA3AF" }}>Tất cả</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Filter: Exam Type */}
            <View className="mb-8">
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-sm mb-4 ml-1">Loại kỳ thi</Text>
              <View className="flex-row flex-wrap gap-2">
                 {["Giữa Kì", "Cuối Kì"].map(type => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setModalType(type)}
                      className={`px-5 py-3 rounded-2xl items-center ${modalType === type ? "bg-[#DBEAFE]" : "bg-gray-50"}`}
                    >
                      <Text style={{ fontFamily: "Poppins-Bold", fontSize: 12, color: modalType === type ? "#1D4ED8" : "#9CA3AF" }}>{type}</Text>
                    </TouchableOpacity>
                 ))}
                 <TouchableOpacity
                      onPress={() => setModalType("")}
                      className={`px-5 py-3 rounded-2xl items-center ${modalType === "" ? "bg-[#DBEAFE]" : "bg-gray-50"}`}
                    >
                      <Text style={{ fontFamily: "Poppins-Bold", fontSize: 12, color: modalType === "" ? "#1D4ED8" : "#9CA3AF" }}>Tất cả</Text>
                 </TouchableOpacity>
              </View>
            </View>

            {/* Filter: School Year */}
            <View className="mb-12">
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-sm mb-4 ml-1">Năm học</Text>
              <TextInput
                value={modalYear}
                onChangeText={setModalYear}
                placeholder="2026"
                keyboardType="numeric"
                className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-black text-sm"
                style={{ fontFamily: "Poppins-SemiBold" }}
              />
            </View>

            {/* Modal Buttons */}
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={resetFilters}
                className="flex-1 bg-gray-50 h-16 rounded-[24px] items-center justify-center"
              >
                <Text style={{ fontFamily: "Poppins-Bold", fontSize: 16 }} className="text-gray-400">Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyFilters}
                className="flex-2 bg-[#136ADA] h-16 rounded-[24px] items-center justify-center shadow-lg shadow-blue-200"
              >
                <Text style={{ fontFamily: "Poppins-Bold", fontSize: 16 }} className="text-white">Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={data?.items || []}
          renderItem={renderItem}
          keyExtractor={(item) => item.examScheduleId}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 100,
            paddingTop: 10,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#136ADA"
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons
                name="document-text-outline"
                size={64}
                color="#D1D5DB"
              />
              <Text className="text-gray-400 mt-4 font-medium text-center">
                Không tìm thấy lịch thi nào.{"\n"}Chạm (+) để tạo mới.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ExamScheduleIndex;
