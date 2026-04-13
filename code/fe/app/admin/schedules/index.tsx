import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { AdminLayout } from "../../../components/ui/AdminLayout";
import { useState, useEffect, useCallback } from "react";
import { scheduleService } from "../../../services/schedule.service";
import { classYearService } from "../../../services/classYear.service";
import { ScheduleSummary } from "../../../types/schedule";
import { ClassYearResponse } from "../../../types/classYear";

export default function AdminSchedulesScreen() {
  const [schedules, setSchedules] = useState<ScheduleSummary[]>([]);
  const [classes, setClasses] = useState<ClassYearResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // States for applied filters
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>();
  const [term, setTerm] = useState("1");
  const [search, setSearch] = useState("");

  // States for modal inputs
  const [tempClassId, setTempClassId] = useState<string | undefined>();
  const [tempTerm, setTempTerm] = useState("1");
  const [tempSearch, setTempSearch] = useState("");

  const loadClasses = async () => {
    try {
      const res = await classYearService.getClassYears({ schoolYear: "2026" });
      setClasses(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await scheduleService.getSchedules({
        classYearId: selectedClassId,
        term,
        pageSize: 50,
      });
      const data = Array.isArray(res) ? res : (res as any).items || [];
      setSchedules(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, term]);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSchedules();
    setRefreshing(false);
  };

  const openFilter = () => {
    setTempSearch(search);
    setTempClassId(selectedClassId);
    setTempTerm(term);
    setIsFilterVisible(true);
  };

  const applyFilters = () => {
    setSearch(tempSearch);
    setSelectedClassId(tempClassId);
    setTerm(tempTerm);
    setIsFilterVisible(false);
  };

  const resetFilters = () => {
    setTempSearch("");
    setTempClassId(undefined);
    setTempTerm("1");
    setSearch("");
    setSelectedClassId(undefined);
    setTerm("1");
    setIsFilterVisible(false);
  };

  // Frontend filtering as backend doesn't support keyword search for summary list yet
  const filteredSchedules = schedules.filter(
    (s) =>
      s.className.toLowerCase().includes(search.toLowerCase()) ||
      (s.name && s.name.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <AdminLayout
      title="Thời khóa biểu"
      rightComponent={
        <TouchableOpacity
          onPress={() => router.push("/admin/schedules/create" as any)}
          className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100"
        >
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#136ADA] text-xs">Thêm mới</Text>
        </TouchableOpacity>
      }
      searchProps={{
        value: search,
        onChangeText: setSearch,
        placeholder: "Tìm kiếm lớp...",
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
          <View className="bg-white rounded-t-[40px] px-8 py-10 shadow-2xl max-h-[85%]">
            <View className="flex-row justify-between items-center mb-10">
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-3xl text-black">Bộ lọc</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)} className="bg-gray-100 p-2 rounded-full">
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="mb-10">
              {/* Filter: Term */}
              <View className="mb-8">
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-xs mb-3 ml-1">HỌC KỲ</Text>
                <View className="flex-row gap-2">
                  {["1", "2"].map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setTempTerm(t)}
                      className={`px-4 py-2 rounded-xl border ${tempTerm === t ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
                    >
                      <Text style={{ fontFamily: "Poppins-Bold", fontSize: 11, color: tempTerm === t ? "#1D4ED8" : "#9CA3AF" }}>
                        HỌC KỲ {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filter: Class */}
              <View className="mb-4">
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-xs mb-3 ml-1">LỚP HỌC</Text>
                <View className="flex-row flex-wrap gap-2">
                  <TouchableOpacity
                    onPress={() => setTempClassId(undefined)}
                    className={`px-4 py-2 rounded-xl border ${tempClassId === undefined ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
                  >
                    <Text style={{ fontFamily: "Poppins-Bold", fontSize: 11, color: tempClassId === undefined ? "#1D4ED8" : "#9CA3AF" }}>
                      TẤT CẢ CÁC LỚP
                    </Text>
                  </TouchableOpacity>
                  {classes.map((c) => (
                    <TouchableOpacity
                      key={c.classYearId}
                      onPress={() => setTempClassId(c.classYearId)}
                      className={`px-4 py-2 rounded-xl border ${tempClassId === c.classYearId ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
                    >
                      <Text style={{ fontFamily: "Poppins-Bold", fontSize: 11, color: tempClassId === c.classYearId ? "#1D4ED8" : "#9CA3AF" }}>
                        {c.className.toUpperCase()}
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

      {/* New Standardized Schedule List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={filteredSchedules}
          keyExtractor={(item, index) => item.scheduleId || index.toString()}
          className="bg-white"
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, gap: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#136ADA" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100"
              onPress={() => router.push(`/admin/schedules/${item.scheduleId}` as any)}
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                  <Text style={{ fontFamily: "Poppins-Bold", fontSize: 16 }} className="text-black mb-1" numberOfLines={1}>
                    {item.name || `Thời khóa biểu - ${item.className}`}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-1.5 text-wrap">
                    <View className="bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                      <Text style={{ fontFamily: "Poppins-Bold", fontSize: 10, color: "#136ADA" }}>Lớp {item.className}</Text>
                    </View>
                    <View className="bg-white px-2.5 py-1 rounded-xl border border-gray-100">
                      <Text style={{ fontFamily: "Poppins-Medium", fontSize: 10, color: "#9CA3AF" }}>HỌC KỲ {item.term}</Text>
                    </View>
                  </View>
                </View>
                <View className="w-12 h-12 rounded-2xl bg-amber-50 items-center justify-center border border-amber-100">
                  <Ionicons name="calendar-outline" size={24} color="#D97706" />
                </View>
              </View>

              <View className="flex-row items-center justify-end pt-3 border-t border-gray-50/50">
                <Text style={{ fontFamily: "Poppins-Bold", fontSize: 11 }} className="text-[#136ADA]">Quản lý tiết học</Text>
                <Ionicons name="chevron-forward" size={14} color="#136ADA" style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200 mx-6">
              <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-4 text-center px-10">
                Không tìm thấy thời khóa biểu học tập nào.{"\n"}Hãy thử điều chỉnh bộ lọc.
              </Text>
            </View>
          }
          ListFooterComponent={<View className="h-20 bg-white" />}
        />
      )}
    </AdminLayout>
  );
}
