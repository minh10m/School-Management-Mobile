import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TeacherScheduleDetailItem } from "../../../types/schedule";
import { scheduleService } from "../../../services/schedule.service";
import { SCHOOL_YEAR, TERM } from "../../../constants/config";

const WEEK_DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];

const BG_COLORS = [
  "bg-purple-50",
  "bg-cyan-50",
  "bg-blue-50",
  "bg-rose-50",
  "bg-green-50",
  "bg-orange-50",
];

export default function TeacherSchedules() {
  const [schedules, setSchedules] = useState<TeacherScheduleDetailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(() => {
    const day = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    if (day >= 1 && day <= 5) return WEEK_DAYS[day - 1];
    return "Thứ 2"; // Default to Monday on weekends
  });
  const [isDaySelectorOpen, setDaySelectorOpen] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getMyTeachingSchedule({
        Term: TERM,
        SchoolYear: Number(SCHOOL_YEAR),
      });
      setSchedules(data || []);
    } catch (error) {
      console.error("Failed to fetch teacher schedules:", error);
      setSchedules([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSchedules();
  };

  // Filter schedules for the selected day using dayOfWeek (1=Mon, 2=Tue, etc.)
  const filteredSchedules = schedules
    .filter((item) => {
      const dayIndex = WEEK_DAYS.indexOf(selectedDay); // Monday=0, Tuesday=1 ...
      if (dayIndex === -1) return false;

      // API uses 1 for Monday, 2 for Tuesday, ..., 7 for Sunday (as per types)
      return item.dayOfWeek === dayIndex + 1;
    })
    .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar hidden />

      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text
          className="text-black text-lg"
          style={{ fontFamily: "Poppins-Bold" }}
        >
          Thời khóa biểu giảng dạy
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#136ADA"
          />
        }
      >
        {/* Select Day Dropdown */}
        <TouchableOpacity
          className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 flex-row justify-between items-center shadow-sm"
          onPress={() => setDaySelectorOpen(!isDaySelectorOpen)}
        >
          <Text
            className="text-black text-sm"
            style={{ fontFamily: "Poppins-Bold" }}
          >
            {selectedDay}
          </Text>
          <Ionicons
            name={isDaySelectorOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color="black"
          />
        </TouchableOpacity>

        {isDaySelectorOpen && (
          <View className="bg-white border border-gray-100 rounded-2xl p-2 mb-4 shadow-sm">
            {WEEK_DAYS.map((day) => (
              <TouchableOpacity
                key={day}
                className={`p-3 rounded-xl ${selectedDay === day ? "bg-blue-50" : ""}`}
                onPress={() => {
                  setSelectedDay(day);
                  setDaySelectorOpen(false);
                }}
              >
                <Text
                  className={`text-sm ${selectedDay === day ? "text-blue-600" : "text-gray-600"}`}
                  style={{
                    fontFamily:
                      selectedDay === day
                        ? "Poppins-Medium"
                        : "Poppins-Regular",
                  }}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* List Header */}
        <View className="flex-row mb-4">
          <Text
            className="text-gray-500 text-xs w-20 text-center uppercase tracking-widest"
            style={{ fontFamily: "Poppins-Bold" }}
          >
            Giờ
          </Text>
          <Text
            className="text-gray-500 text-xs flex-1 ml-4 uppercase tracking-widest"
            style={{ fontFamily: "Poppins-Bold" }}
          >
            Tiết dạy
          </Text>
        </View>

        {/* List */}
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#136ADA" className="mt-10" />
        ) : filteredSchedules.length === 0 ? (
          <View className="py-20 lg:py-40 items-center justify-center">
            <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
              <Ionicons name="calendar-outline" size={32} color="#D1D5DB" />
            </View>
            <Text
              style={{ fontFamily: "Poppins-Bold" }}
              className="text-gray-400 text-center"
            >
              Hôm nay không có tiết dạy
            </Text>
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-300 text-xs text-center mt-1"
            >
              Hãy tận hưởng thời gian rảnh hoặc chọn ngày khác.
            </Text>
          </View>
        ) : (
          <View className="pb-20">
            {filteredSchedules.map((item, index) => {
              const bg = BG_COLORS[index % BG_COLORS.length];
              return (
                <View key={item.scheduleDetailId} className="flex-row mb-6">
                  <View className="w-20 items-end pr-2 pt-2">
                    <Text
                      className="text-black text-sm"
                      style={{ fontFamily: "Poppins-Bold" }}
                    >
                      {item.timeRange
                        ? item.timeRange.split(" - ")[0]
                        : item.startTime
                          ? item.startTime.slice(0, 5)
                          : "--"}
                    </Text>
                    <Text
                      className="text-gray-400 text-xs"
                      style={{ fontFamily: "Poppins-Regular" }}
                    >
                      {item.timeRange
                        ? item.timeRange.split(" - ")[1]
                        : item.finishTime
                          ? item.finishTime.slice(0, 5)
                          : "--"}
                    </Text>
                  </View>
                  <View className="items-center relative mr-4">
                    <View className="h-full w-[2px] bg-gray-100 absolute top-0" />
                    <View className="w-3 h-3 rounded-full bg-blue-600 mt-3 border-2 border-white shadow-sm" />
                  </View>
                  <View className="flex-1">
                    <View
                      className={`${bg} rounded-3xl p-5 flex-row items-center border border-white/20 shadow-sm relative overflow-hidden`}
                    >
                      <View className="absolute -right-4 -top-4 w-16 h-16 bg-white/20 rounded-full" />
                      <View className="w-12 h-12 bg-white/50 rounded-2xl items-center justify-center mr-3">
                        <Ionicons
                          name="school-outline"
                          size={24}
                          color="#136ADA"
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-black text-base"
                          style={{ fontFamily: "Poppins-Bold" }}
                          numberOfLines={1}
                        >
                          {item.subjectName}
                        </Text>
                        <View className="flex-row items-center mt-0.5">
                          <Text
                            className="text-gray-500 text-xs uppercase mr-2"
                            style={{ fontFamily: "Poppins-Bold" }}
                          >
                            Lớp {item.className}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
