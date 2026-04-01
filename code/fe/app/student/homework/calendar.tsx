import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MENU_ITEMS = [
  {
    label: "Attendance",
    description: "View your monthly attendance record",
    icon: "calendar-outline",
    color: "#136ADA",
    bg: "bg-blue-50",
    route: "/student/attendance",
  },
  {
    label: "Timetable",
    description: "Check your weekly class schedule",
    icon: "time-outline",
    color: "#A855F7",
    bg: "bg-purple-50",
    route: "/student/timetable",
  },
  {
    label: "Events",
    description: "Upcoming school events and activities",
    icon: "megaphone-outline",
    color: "#F97316",
    bg: "bg-orange-50",
    route: "/student/events",
  },
];

export default function CalendarScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden />

      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-black text-lg" style={{ fontFamily: "Poppins-Bold" }}>
          Calendar
        </Text>
      </View>

      {/* Menu */}
      <View className="flex-1 px-6 pt-8 gap-4">
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.label}
            onPress={() => router.push(item.route as any)}
            className="flex-row items-center bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
            activeOpacity={0.7}
          >
            <View className={`${item.bg} w-14 h-14 rounded-2xl items-center justify-center mr-4`}>
              <Ionicons name={item.icon as any} size={26} color={item.color} />
            </View>
            <View className="flex-1">
              <Text className="text-black text-base" style={{ fontFamily: "Poppins-SemiBold" }}>
                {item.label}
              </Text>
              <Text className="text-gray-400 text-xs mt-0.5" style={{ fontFamily: "Poppins-Regular" }}>
                {item.description}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
