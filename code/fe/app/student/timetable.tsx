import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TIMETABLE_DATA = [
  { time: "9.00Am", endTime: "9.50Am", subject: "Mathematics", teacher: "By Renuka Sivakumar", bg: "bg-purple-100" },
  { time: "10.00Am", endTime: "10.50Am", subject: "English", teacher: "By Nandini Ravikumar", bg: "bg-cyan-100" },
  { time: "10.50Am", endTime: "11.05Am", title: "Morning Break", isBreak: true, bg: "bg-yellow-100" },
  { time: "11.05Am", endTime: "11.50Am", subject: "Science", teacher: "By Vinothi Ravichandran", bg: "bg-blue-100" },
  { time: "12.00Pm", endTime: "12.50Pm", subject: "Social Science", teacher: "By Sushil kumar", bg: "bg-red-100" },
  { time: "1.00Pm", endTime: "1.40Pm", title: "Lunch Break", isBreak: true, bg: "bg-yellow-100" },
];

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function TimetablePage() {
  const [selectedDay, setSelectedDay] = useState("Wednesday");
  const [isDaySelectorOpen, setDaySelectorOpen] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-black text-lg" style={{ fontFamily: "Poppins-Bold" }}>
          Timetable
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {/* Select Day Dropdown */}
        <TouchableOpacity
          className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 flex-row justify-between items-center shadow-sm"
          onPress={() => setDaySelectorOpen(!isDaySelectorOpen)}
        >
          <Text className="text-black text-sm" style={{ fontFamily: "Poppins-Bold" }}>{selectedDay}</Text>
          <Ionicons name={isDaySelectorOpen ? "chevron-up" : "chevron-down"} size={20} color="black" />
        </TouchableOpacity>

        {isDaySelectorOpen && (
          <View className="bg-white border border-gray-100 rounded-2xl p-2 mb-4 shadow-sm">
            {WEEK_DAYS.map((day) => (
              <TouchableOpacity
                key={day}
                className={`p-3 rounded-xl ${selectedDay === day ? "bg-blue-50" : ""}`}
                onPress={() => { setSelectedDay(day); setDaySelectorOpen(false); }}
              >
                <Text
                  className={`text-sm ${selectedDay === day ? "text-blue-600" : "text-gray-600"}`}
                  style={{ fontFamily: selectedDay === day ? "Poppins-Medium" : "Poppins-Regular" }}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Header */}
        <View className="flex-row mb-4">
          <Text className="text-gray-500 text-xs w-20 text-center" style={{ fontFamily: "Poppins-Medium" }}>Time</Text>
          <Text className="text-gray-500 text-xs flex-1 ml-4" style={{ fontFamily: "Poppins-Medium" }}>Class</Text>
        </View>

        {/* List */}
        <View className="pb-10">
          {TIMETABLE_DATA.map((item, index) => (
            <View key={index} className="flex-row mb-6">
              <View className="w-20 items-end pr-2 pt-2">
                <Text className="text-black text-sm" style={{ fontFamily: "Poppins-Bold" }}>{item.time}</Text>
                <Text className="text-gray-400 text-[10px]" style={{ fontFamily: "Poppins-Regular" }}>{item.endTime}</Text>
              </View>
              <View className="items-center relative mr-4">
                <View className="h-full w-[2px] bg-blue-100 absolute top-0" />
                <View className="w-3 h-3 rounded-full bg-blue-600 mt-3" />
              </View>
              <View className="flex-1">
                {item.isBreak ? (
                  <View className={`${item.bg} rounded-2xl p-4 justify-center`}>
                    <Text className="text-black text-sm text-center" style={{ fontFamily: "Poppins-Bold" }}>{item.title}</Text>
                  </View>
                ) : (
                  <View className={`${item.bg} rounded-2xl p-4 flex-row items-center`}>
                    <View className="w-10 h-10 bg-white/50 rounded-full items-center justify-center mr-3">
                      <Ionicons name="person" size={20} color="gray" />
                    </View>
                    <View>
                      <Text className="text-black text-sm" style={{ fontFamily: "Poppins-Bold" }}>{item.subject}</Text>
                      <Text className="text-gray-500 text-xs" style={{ fontFamily: "Poppins-Regular" }}>{item.teacher}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
