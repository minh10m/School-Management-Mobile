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
import { router } from "expo-router";
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
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-xl text-black"
          >
            Thời khóa biểu
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/admin/schedules/create" as any)}
          className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100"
        >
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-[#136ADA] text-xs"
          >
            Thêm mới
          </Text>
        </TouchableOpacity>
      </View>

      {/* Synchronized Search Bar Section */}
      <View className="px-6 py-4 flex-row items-center gap-4 bg-white border-b border-gray-50">
        <View className="flex-1 bg-gray-50 flex-row items-center px-4 py-2.5 rounded-2xl border border-gray-100">
          <Ionicons name="search-outline" size={20} color="#9ca3af" />
          <TextInput
            placeholder="Tìm lớp hoặc tên..."
            className="flex-1 ml-2 text-black text-sm"
            style={{ fontFamily: "Poppins-Regular" }}
            value={tempSearch}
            onChangeText={setTempSearch}
            onSubmitEditing={applyFilters}
          />
        </View>
        <TouchableOpacity
          onPress={openFilter}
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
          <View className="bg-white rounded-t-[40px] px-8 py-10 shadow-2xl max-h-[85%]">
            <View className="flex-row justify-between items-center mb-10">
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-3xl text-black">Lọc Thời khóa biểu</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)} className="bg-gray-100 p-2 rounded-full">
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="mb-10">
              {/* Filter: Term */}
              <View className="mb-8">
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-sm mb-4 ml-1">Học kỳ</Text>
                <View className="flex-row gap-3">
                  {["1", "2"].map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setTempTerm(t)}
                      className={`px-6 py-3.5 rounded-2xl items-center ${tempTerm === t ? "bg-[#DBEAFE]" : "bg-gray-50"}`}
                    >
                      <Text style={{ fontFamily: "Poppins-Bold", fontSize: 13, color: tempTerm === t ? "#1D4ED8" : "#9CA3AF" }}>Học kỳ {t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filter: Class */}
              <View className="mb-4">
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-sm mb-4 ml-1">Áp dụng cho lớp</Text>
                <View className="flex-row flex-wrap gap-3">
                  <TouchableOpacity
                    onPress={() => setTempClassId(undefined)}
                    className={`px-5 py-3 rounded-2xl items-center ${tempClassId === undefined ? "bg-[#DBEAFE]" : "bg-gray-50"}`}
                  >
                    <Text style={{ fontFamily: "Poppins-Bold", fontSize: 13, color: tempClassId === undefined ? "#1D4ED8" : "#9CA3AF" }}>Tất cả các lớp</Text>
                  </TouchableOpacity>
                  {classes.map((c) => (
                    <TouchableOpacity
                      key={c.classYearId}
                      onPress={() => setTempClassId(c.classYearId)}
                      className={`px-5 py-3 rounded-2xl items-center ${tempClassId === c.classYearId ? "bg-[#DBEAFE]" : "bg-gray-50"}`}
                    >
                      <Text style={{ fontFamily: "Poppins-Bold", fontSize: 13, color: tempClassId === c.classYearId ? "#1D4ED8" : "#9CA3AF" }}>{c.className}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

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

      {/* List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={filteredSchedules}
          keyExtractor={(item, index) => item.scheduleId || index.toString()}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingVertical: 16,
            gap: 12,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#136ADA"
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm"
              onPress={() =>
                router.push(`/admin/schedules/${item.scheduleId}` as any)
              }
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: "Poppins-Bold" }}
                    className="text-black text-base"
                    numberOfLines={1}
                  >
                    {item.name || `Thời khóa biểu - ${item.className}`}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-1.5">
                    <View className="bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                      <Text
                        style={{
                          fontFamily: "Poppins-Bold",
                          fontSize: 10,
                          color: "#136ADA",
                        }}
                      >
                        Lớp {item.className}
                      </Text>
                    </View>
                    <View className="bg-gray-50 px-2.5 py-1 rounded-lg">
                      <Text
                        style={{
                          fontFamily: "Poppins-Medium",
                          fontSize: 10,
                          color: "#9CA3AF",
                        }}
                      >
                        Học kỳ {item.term}
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="w-12 h-12 rounded-2xl bg-amber-50 items-center justify-center border border-amber-100">
                  <Ionicons name="calendar" size={24} color="#D97706" />
                </View>
              </View>

              <View className="flex-row items-center justify-end pt-3 border-t border-gray-50/50">
                <Text
                  style={{ fontFamily: "Poppins-Bold", fontSize: 11 }}
                  className="text-[#136ADA]"
                >
                  Quản lý tiết học
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color="#136ADA"
                  style={{ marginLeft: 4 }}
                />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-20">
              <View className="w-16 h-16 rounded-full bg-gray-50 items-center justify-center mb-4">
                <Ionicons name="calendar-outline" size={32} color="#D1D5DB" />
              </View>
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-400 text-center"
              >
                Không tìm thấy thời khóa biểu nào.{"\n"}Hãy thử điều chỉnh bộ lọc.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
