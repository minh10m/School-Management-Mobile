import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { AdminPageWrapper } from "../../../components/ui/AdminPageWrapper";
import { useState, useEffect, useCallback } from "react";
import { eventService } from "../../../services/event.service";
import { EventItem } from "../../../types/event";
import { SCHOOL_YEAR, TERM } from "../../../constants/config";

export default function AdminEventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Applied Filters
  const [search, setSearch] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<number>(
    parseInt(SCHOOL_YEAR, 10),
  );
  const [activeTab, setActiveTab] = useState<
    "All" | "Upcoming" | "Ongoing" | "Finished"
  >("All");

  // Local Modal States
  const [tempSearch, setTempSearch] = useState("");
  const [tempTerm, setTempTerm] = useState(1);
  const [tempYear, setTempYear] = useState(parseInt(SCHOOL_YEAR, 10));

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await eventService.getEvents({
        Title: search.trim() || undefined,
        SchoolYear: selectedYear,
        Term: selectedTerm,
      });
      setEvents(res.items || []);
    } catch (err) {
      console.log("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedYear, selectedTerm]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const openFilter = () => {
    setTempSearch(search);
    setTempTerm(selectedTerm);
    setTempYear(selectedYear);
    setIsFilterVisible(true);
  };

  const applyFilters = () => {
    setSearch(tempSearch);
    setSelectedTerm(tempTerm);
    setSelectedYear(tempYear);
    setIsFilterVisible(false);
  };

  const resetFilters = () => {
    setTempSearch("");
    setTempTerm(1);
    setTempYear(parseInt(SCHOOL_YEAR, 10));
    setSearch("");
    setSelectedTerm(1);
    setSelectedYear(parseInt(SCHOOL_YEAR, 10));
    setIsFilterVisible(false);
  };

  const filteredEvents = events.filter((e) => {
    if (activeTab === "All") return true;
    const now = new Date();
    const s = new Date(`${e.eventDate}T${e.startTime}`);
    const f = new Date(`${e.eventDate}T${e.finishTime}`);
    if (activeTab === "Upcoming") return now < s;
    if (activeTab === "Finished") return now > f;
    if (activeTab === "Ongoing") return now >= s && now <= f;
    return true;
  });

  const getStatus = (item: EventItem) => {
    const now = new Date();
    const s = new Date(`${item.eventDate}T${item.startTime}`);
    const f = new Date(`${item.eventDate}T${item.finishTime}`);
    if (now < s)
      return { label: "Sắp tới", color: "text-blue-500", bg: "bg-blue-50" };
    if (now > f)
      return { label: "Đã kết thúc", color: "text-gray-400", bg: "bg-gray-50" };
    return {
      label: "Đang diễn ra",
      color: "text-green-500",
      bg: "bg-green-50",
    };
  };

  return (
    <AdminPageWrapper
      title="Sự kiện"
      rightComponent={
        <TouchableOpacity
          onPress={() => router.push("/admin/events/create" as any)}
          className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100"
        >
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#136ADA] text-xs">Thêm mới</Text>
        </TouchableOpacity>
      }
      searchProps={{
        value: search,
        onChangeText: setSearch,
        placeholder: "Tìm kiếm sự kiện...",
        onFilterPress: openFilter,
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />

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
                className="bg-gray-100 p-2 rounded-full"
              >
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="mb-10">
              {/* Filter: Status */}
              <View className="mb-8">
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-xs mb-3 ml-1">TRẠNG THÁI</Text>
                <View className="flex-row flex-wrap gap-2">
                  {["All", "Upcoming", "Ongoing", "Finished"].map((t: any) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setActiveTab(t)}
                      className={`px-4 py-2 rounded-xl border ${activeTab === t ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
                    >
                      <Text style={{ fontFamily: "Poppins-Bold", fontSize: 11, color: activeTab === t ? "#1D4ED8" : "#9CA3AF" }}>
                        {(t === "All" ? "Tất cả" : t === "Upcoming" ? "Sắp tới" : t === "Ongoing" ? "Đang diễn ra" : "Đã kết thúc").toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filter: Term */}
              <View className="mb-8">
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-xs mb-3 ml-1">HỌC KỲ</Text>
                <View className="flex-row gap-2">
                  {[1, 2].map((t) => (
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

              {/* Filter: Year */}
              <View className="mb-4">
                <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-xs mb-3 ml-1">NĂM HỌC</Text>
                <View className="flex-row flex-wrap gap-2">
                  {[2024, 2025, 2026].map((y) => (
                    <TouchableOpacity
                      key={y}
                      onPress={() => setTempYear(y)}
                      className={`px-4 py-2 rounded-xl border ${tempYear === y ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
                    >
                      <Text style={{ fontFamily: "Poppins-Bold", fontSize: 11, color: tempYear === y ? "#1D4ED8" : "#9CA3AF" }}>
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

      {/* Event List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item, index) => item.eventId || index.toString()}
          className="bg-white"
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, gap: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchEvents} tintColor="#136ADA" />}
          renderItem={({ item }) => {
            const status = getStatus(item);
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-sm"
                onPress={() =>
                  router.push({
                    pathname: "/admin/events/create",
                    params: { id: item.eventId },
                  } as any)
                }
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 pr-4">
                    <View className="flex-row items-center gap-2 mb-2">
                      <View className={`${status.bg} px-2.5 py-1 rounded-lg`}>
                        <Text
                          className={`${status.color} text-[9px]`}
                          style={{ fontFamily: "Poppins-Bold" }}
                        >
                          {status.label.toUpperCase()}
                        </Text>
                      </View>
                      <Text
                        className="text-gray-300 text-[10px]"
                        style={{ fontFamily: "Poppins-Medium" }}
                      >
                        Học kỳ {item.term} · {item.schoolYear}
                      </Text>
                    </View>
                    <Text
                      numberOfLines={2}
                      className="text-black text-base leading-6"
                      style={{ fontFamily: "Poppins-Bold" }}
                    >
                      {item.title}
                    </Text>
                  </View>
                  <View className="bg-blue-50/50 w-10 h-10 rounded-2xl items-center justify-center border border-blue-100/50">
                    <Ionicons name="calendar" size={20} color="#136ADA" />
                  </View>
                </View>

                <View className="flex-row items-center justify-between pt-3 border-t border-gray-50/50">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                    <Text
                      className="text-gray-400 text-[11px]"
                      style={{ fontFamily: "Poppins-Medium" }}
                    >
                      {new Date(item.eventDate).toLocaleDateString("en-GB")} ·{" "}
                      {item.startTime.slice(0, 5)} - {item.finishTime.slice(0, 5)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200 mx-6">
              <Ionicons name="megaphone-outline" size={64} color="#D1D5DB" />
              <Text
                className="text-gray-400 text-center mt-4"
                style={{ fontFamily: "Poppins-Medium" }}
              >
                Không tìm thấy sự kiện nào.{"\n"}Hãy thử điều chỉnh bộ lọc.
              </Text>
            </View>
          }
          ListFooterComponent={<View className="h-20 bg-white" />}
        />
      )}
    </AdminPageWrapper>
  );
}
