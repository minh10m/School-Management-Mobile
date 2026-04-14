import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SideMenu from "@/components/SideMenu";
import { assignmentService } from "../../services/assignment.service";
import { eventService } from "../../services/event.service";
import { useAuthStore } from "../../store/authStore";
import { AdminPageWrapper } from "../../components/ui/AdminPageWrapper";

export default function HomeScreen() {
  const [isMenuVisible, setMenuVisible] = useState(false);
  const { userInfo } = useAuthStore();
  const firstName = userInfo?.fullName?.split(" ").at(-1) ?? "Học sinh";

  const [events, setEvents] = useState<any[]>([]);
  const [eventLoading, setEventLoading] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchAssignments();
  }, []);

  const fetchEvents = async () => {
    try {
      setEventLoading(true);
      const res = await eventService.getEvents({ SchoolYear: 2026, Term: 1 });
      setEvents(res.items || []);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setEventLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      setAssignmentLoading(true);
      const res = await assignmentService.getMyAssignments();
      setAssignments(res || []);
    } catch (err) {
      console.error("Error fetching assignments:", err);
    } finally {
      setAssignmentLoading(false);
    }
  };

  const calculateDaysLeft = (finishTime: string) => {
    const end = new Date(finishTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return "Quá hạn";
    if (days === 0) return "Hạn hôm nay";
    return `Còn ${days} ngày`;
  };

  const latestEvent = events[0];

  const formatEventDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const day = d.getDate().toString().padStart(2, "0");
      const monthNames = [
        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
      ];
      const month = monthNames[d.getMonth()];
      const year = d.getFullYear();
      const weekDays = [
        "Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"
      ];
      const weekDay = weekDays[d.getDay()];
      return `${weekDay}, ngày ${day} ${month}, ${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  const eventTitleParts = latestEvent?.title?.split(" ") || ["Sports", "Day"];
  const firstTitlePart = eventTitleParts[0];
  const lastTitlePart = eventTitleParts.slice(1).join(" ");

  const academicsData = [
    {
      id: "2",
      title: "Lịch thi",
      icon: "calendar",
      color: "bg-orange-100",
      iconColor: "#F97316",
    },
    {
      id: "3",
      title: "Học phí",
      icon: "cash",
      color: "bg-purple-100",
      iconColor: "#A855F7",
    },
    {
      id: "4",
      title: "Bài tập",
      icon: "document-text",
      color: "bg-teal-100",
      iconColor: "#14B8A6",
    },
    {
      id: "5",
      title: "Kết quả",
      icon: "pie-chart",
      color: "bg-yellow-100",
      iconColor: "#EAB308",
    },
    {
      id: "6",
      title: "Lịch học",
      icon: "time",
      color: "bg-blue-50",
      iconColor: "#3B82F6",
    },
    {
      id: "7",
      title: "Điểm danh",
      icon: "calendar",
      color: "bg-red-50",
      iconColor: "#EF4444",
    },
    {
      id: "8",
      title: "Khóa học",
      icon: "file-tray-full",
      color: "bg-indigo-50",
      iconColor: "#4F46E5",
    },
  ];

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
          onPress={() => router.push("/student/notifications" as any)}
        >
          <Ionicons name="notifications-outline" size={28} color="black" />
        </TouchableOpacity>
      }
    >
      <StatusBar hidden />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* Greeting */}
        <View className="px-6 mb-8">
          <Text
            className="text-black text-xl"
            style={{ fontFamily: "Poppins-SemiBold" }}
          >
            Chào mừng bạn, {firstName} 👋
          </Text>
        </View>

        {/* Academics Grid */}
        <View className="px-6 mb-8">
          <Text
            className="text-black text-base mb-4"
            style={{ fontFamily: "Poppins-Medium" }}
          >
            Học tập
          </Text>
          <View className="flex-row flex-wrap justify-between gap-y-4">
            {academicsData.map((item) => (
              <TouchableOpacity
                key={item.id}
                className={`${item.color} w-[31%] py-6 rounded-2xl items-center justify-center gap-2`}
                onPress={() => {
                  if (item.title === "Bài tập") {
                    router.push("/student/assignments" as any);
                  } else if (item.title === "Lịch thi") {
                    router.push("/student/exam-schedule" as any);
                  } else if (item.title === "Học phí") {
                    router.push("/student/payment" as any);
                  } else if (item.title === "Kết quả") {
                    router.push("/student/results" as any);
                  } else if (item.title === "Lịch học") {
                    router.push("/(tabs)/timetable" as any);
                  } else if (item.title === "Điểm danh") {
                    router.push("/(tabs)/attendance" as any);
                  } else if (item.title === "Khóa học") {
                    router.push("/student/courses" as any);
                  }
                }}
              >
                <View className="w-10 h-10 bg-white/50 rounded-full items-center justify-center">
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={item.iconColor}
                  />
                </View>
                <Text
                  className="text-black text-xs text-center"
                  style={{ fontFamily: "Poppins-Medium" }}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Assignments */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center px-6 mb-4">
            <Text
              className="text-black text-base"
              style={{ fontFamily: "Poppins-Medium" }}
            >
              Bài tập
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/student/assignments" as any)}
            >
              <Text
                className="text-bright-blue text-sm"
                style={{ fontFamily: "Poppins-Medium" }}
              >
                Xem tất cả
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={assignments}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
            renderItem={({ item }) => (
              <View className="bg-bright-blue w-72 p-5 rounded-[32px]">
                <View className="flex-row justify-between items-start mb-6">
                  <View className="flex-row items-center gap-3">
                    <View className="bg-white/20 p-2 rounded-xl">
                      <Ionicons
                        name="clipboard-outline"
                        size={22}
                        color="white"
                      />
                    </View>
                    <View>
                      <Text
                        className="text-white text-lg"
                        style={{ fontFamily: "Poppins-Bold" }}
                      >
                        {item.subjectName}
                      </Text>
                      <View className="flex-row items-center gap-1 mt-0.5">
                        <Ionicons name="time-outline" size={14} color="white" />
                        <Text
                          className="text-white/80 text-[10px]"
                          style={{ fontFamily: "Poppins-Regular" }}
                        >
                          {calculateDaysLeft(item.finishTime)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="w-12 h-12 rounded-full border-[3px] border-white/20 items-center justify-center relative">
                    {/* Semi-transparent track */}
                    <View
                      className="absolute inset-0 rounded-full border-[3px] border-white opacity-40"
                      style={{
                        borderLeftColor: "transparent",
                        borderBottomColor: "transparent",
                        transform: [{ rotate: "45deg" }],
                      }}
                    />
                    <Text
                      className="text-white text-[10px]"
                      style={{ fontFamily: "Poppins-Bold" }}
                    >
                      50%
                    </Text>
                  </View>
                </View>

                <Text
                  className="text-white text-lg mb-6 leading-tight"
                  style={{ fontFamily: "Poppins-Medium" }}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>

                <View className="items-end">
                  <TouchableOpacity
                    className="bg-white px-6 py-2.5 rounded-xl shadow-sm"
                    onPress={() =>
                      router.push(
                        `/student/assignments/${item.assignmentId}` as any,
                      )
                    }
                  >
                    <Text
                      className="text-bright-blue text-sm"
                      style={{ fontFamily: "Poppins-Bold" }}
                    >
                      Tiếp tục
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.assignmentId}
            ListEmptyComponent={() => (
              <View className="w-72 bg-gray-50 border border-gray-100 p-5 rounded-[32px] items-center justify-center">
                <Ionicons name="document-text-outline" size={32} color="#CCC" />
                <Text
                  className="text-gray-400 mt-2 text-xs"
                  style={{ fontFamily: "Poppins-Medium" }}
                >
                  Không có bài tập đến hạn
                </Text>
              </View>
            )}
          />
        </View>

        {/* Event Updates */}
        <View className="px-6 pb-20">
          <Text
            className="text-black text-lg mb-4"
            style={{ fontFamily: "Poppins-Bold" }}
          >
            Cập nhật sự kiện
          </Text>

          <View className="bg-white border border-gray-100 rounded-[40px] p-6 shadow-sm overflow-hidden min-h-[190px] relative">
            {/* Background decoration */}
            <View
              className="absolute right-[-20] top-10 w-40 h-40 bg-bright-blue/5 rounded-full"
              style={{ transform: [{ scale: 1.2 }] }}
            />

            <View className="z-10 flex-1 justify-between">
              <View>
                <Text
                  className="text-bright-blue text-sm mb-1"
                  style={{ fontFamily: "Poppins-Bold" }}
                >
                  {latestEvent
                    ? formatEventDate(latestEvent.eventDate)
                    : "03, Nov, 2023 | Saturday"}
                </Text>

                <Text
                  className="text-bright-blue leading-tight"
                  style={{
                    fontFamily: "Poppins-Bold",
                    fontSize: (latestEvent?.title?.length || 0) > 15 ? 32 : 44,
                    maxWidth: "75%",
                  }}
                >
                  {latestEvent?.title || "Sports Day"}
                </Text>
              </View>

              <View className="flex-row items-center gap-3 mt-4">
                <View className="bg-bright-blue/10 p-2 rounded-full">
                  <Ionicons
                    name={
                      latestEvent?.title?.toLowerCase().includes("sport") ||
                      latestEvent?.title?.toLowerCase().includes("thao")
                        ? "baseball-outline"
                        : "megaphone-outline"
                    }
                    size={24}
                    color="#136ADA"
                  />
                </View>
                <Text
                  className="text-bright-blue text-xs"
                  style={{ fontFamily: "Poppins-Bold" }}
                >
                  Sự kiện sắp tới
                </Text>
              </View>
            </View>

            {/* Main Decoration icon - Positioned safely */}
            <View className="absolute right-4 bottom-4 opacity-80">
              <Ionicons
                name={
                  latestEvent?.title?.toLowerCase().includes("sport") ||
                  latestEvent?.title?.toLowerCase().includes("thao")
                    ? "basketball-outline"
                    : "calendar-outline"
                }
                size={70}
                color="#136ADA"
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <SideMenu visible={isMenuVisible} onClose={() => setMenuVisible(false)} />
    </AdminPageWrapper>
  );
}
