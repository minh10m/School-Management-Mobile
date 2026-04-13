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
import { router } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { eventService } from "../../../services/event.service";
import { EventItem } from "../../../types/event";
import { SCHOOL_YEAR, TERM } from "../../../constants/config";

export default function AdminEventsScreen() {
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
            Sự kiện
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/admin/events/create" as any)}
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

      {/* Tabs */}
      <View className="flex-row bg-white px-6 py-2 gap-2 mt-2">
        {["All", "Upcoming", "Ongoing", "Finished"].map((t: any) => (
          <TouchableOpacity
            key={t}
            onPress={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded-full ${
              activeTab === t ? "bg-[#136ADA]" : "bg-gray-50"
            }`}
          >
            <Text
              style={{
                fontFamily: "Poppins-Bold",
                fontSize: 10,
                color: activeTab === t ? "white" : "#9CA3AF",
              }}
            >
              {t === "All"
                ? "Tất cả"
                : t === "Upcoming"
                  ? "Sắp tới"
                  : t === "Ongoing"
                    ? "Đang diễn ra"
                    : "Đã kết thúc"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar Section */}
      <View className="px-6 py-4 flex-row items-center gap-4 bg-white border-b border-gray-50">
        <View className="flex-1 bg-gray-50 flex-row items-center px-4 py-2.5 rounded-2xl border border-gray-100">
          <Ionicons name="search-outline" size={20} color="#9ca3af" />
          <TextInput
            placeholder="Search events..."
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
                Filter Schedules
              </Text>
              <TouchableOpacity
                onPress={() => setIsFilterVisible(false)}
                className="bg-gray-100 p-2 rounded-full"
              >
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="mb-10">
              {/* Filter: Term */}
              <View className="mb-8">
                <Text
                  style={{ fontFamily: "Poppins-Medium" }}
                  className="text-gray-500 text-sm mb-4 ml-1"
                >
                  Học kỳ
                </Text>
                <View className="flex-row gap-3">
                  {[1, 2].map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setTempTerm(t)}
                      className={`px-6 py-3.5 rounded-2xl items-center ${tempTerm === t ? "bg-[#DBEAFE]" : "bg-gray-50"}`}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins-Bold",
                          fontSize: 13,
                          color: tempTerm === t ? "#1D4ED8" : "#9CA3AF",
                        }}
                      >
                        Học kỳ {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filter: Year */}
              <View className="mb-4">
                <Text
                  style={{ fontFamily: "Poppins-Medium" }}
                  className="text-gray-500 text-sm mb-4 ml-1"
                >
                  Năm học
                </Text>
                <View className="flex-row flex-wrap gap-3">
                  {[2024, 2025, 2026].map((y) => (
                    <TouchableOpacity
                      key={y}
                      onPress={() => setTempYear(y)}
                      className={`px-5 py-3 rounded-2xl items-center ${tempYear === y ? "bg-[#DBEAFE]" : "bg-gray-50"}`}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins-Bold",
                          fontSize: 13,
                          color: tempYear === y ? "#1D4ED8" : "#9CA3AF",
                        }}
                      >
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
                className="flex-1 bg-gray-50 h-16 rounded-[24px] items-center justify-center"
              >
                <Text
                  style={{ fontFamily: "Poppins-Bold", fontSize: 16 }}
                  className="text-gray-400"
                >
                  Thiết lập lại
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyFilters}
                className="flex-2 bg-[#136ADA] h-16 rounded-[24px] items-center justify-center shadow-lg shadow-blue-200"
              >
                <Text
                  style={{ fontFamily: "Poppins-Bold", fontSize: 16 }}
                  className="text-white"
                >
                  Áp dụng
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* List */}
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.eventId}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 150,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#136ADA"
          />
        }
        renderItem={({ item }) => {
          const status = getStatus(item);
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              className="bg-white border border-gray-100 rounded-3xl p-5 mb-4 shadow-sm"
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
          loading ? (
            <ActivityIndicator color="#136ADA" className="mt-10" />
          ) : (
            <View className="items-center py-20">
              <View className="bg-gray-50 w-16 h-16 rounded-full items-center justify-center mb-4">
                <Ionicons name="megaphone-outline" size={32} color="#D1D5DB" />
              </View>
              <Text
                className="text-gray-400 text-center"
                style={{ fontFamily: "Poppins-Medium" }}
              >
                No events found.{"\n"}Try adjusting your filters.
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
