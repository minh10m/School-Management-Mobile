import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scheduleService } from "../../services/schedule.service";
import { ScheduleDetailItem } from "../../types/schedule";

// dayOfWeek: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 7=Sun
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const SUBJECT_COLORS = [
  "bg-purple-100", "bg-cyan-100", "bg-blue-100",
  "bg-red-100", "bg-green-100", "bg-yellow-100", "bg-pink-100",
];

function subjectColor(subject: string) {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) hash += subject.charCodeAt(i);
  return SUBJECT_COLORS[hash % SUBJECT_COLORS.length];
}

const TERMS = [1, 2];
const SCHOOL_YEARS = [2025, 2026, 2027];

export default function TimetableTab() {
  const now = new Date();
  const todayDow = now.getDay() === 0 ? 7 : now.getDay(); // 1=Mon...7=Sun

  const [term, setTerm] = useState(1);
  const [schoolYear, setSchoolYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState(todayDow <= 5 ? todayDow : 1);
  const [schedule, setSchedule] = useState<ScheduleDetailItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTermPicker, setShowTermPicker] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, [term, schoolYear]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getMyClassSchedule({ Term: term, SchoolYear: schoolYear });
      setSchedule(data);
    } catch (e) {
      console.error("Schedule load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const dayItems = schedule
    .filter((s) => s.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-100">
        <Text className="text-black text-lg" style={{ fontFamily: "Poppins-Bold" }}>Timetable</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-4">

          {/* Term / Year selector */}
          <TouchableOpacity
            className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 flex-row justify-between items-center shadow-sm"
            onPress={() => setShowTermPicker(!showTermPicker)}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="school-outline" size={18} color="#136ADA" />
              <Text className="text-black text-sm" style={{ fontFamily: "Poppins-SemiBold" }}>
                Term {term} · School Year {schoolYear}
              </Text>
            </View>
            <Ionicons name={showTermPicker ? "chevron-up" : "chevron-down"} size={18} color="black" />
          </TouchableOpacity>

          {showTermPicker && (
            <View className="bg-white border border-gray-100 rounded-2xl p-3 mb-4 shadow-sm gap-4">
              <View>
                <Text className="text-gray-400 text-xs mb-2" style={{ fontFamily: "Poppins-Medium" }}>Term</Text>
                <View className="flex-row gap-2">
                  {TERMS.map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => { setTerm(t); }}
                      className={`px-4 py-2 rounded-xl ${term === t ? "bg-blue-600" : "bg-gray-100"}`}
                    >
                      <Text className={`text-sm ${term === t ? "text-white" : "text-gray-600"}`} style={{ fontFamily: "Poppins-Medium" }}>
                        Term {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View>
                <Text className="text-gray-400 text-xs mb-2" style={{ fontFamily: "Poppins-Medium" }}>School Year</Text>
                <View className="flex-row gap-2">
                  {SCHOOL_YEARS.map((y) => (
                    <TouchableOpacity
                      key={y}
                      onPress={() => { setSchoolYear(y); }}
                      className={`px-4 py-2 rounded-xl ${schoolYear === y ? "bg-blue-600" : "bg-gray-100"}`}
                    >
                      <Text className={`text-sm ${schoolYear === y ? "text-white" : "text-gray-600"}`} style={{ fontFamily: "Poppins-Medium" }}>
                        {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Day picker */}
          <View className="flex-row justify-between mb-6">
            {DAY_LABELS.map((label, i) => {
              const dow = i + 1;
              const isActive = selectedDay === dow;
              const hasClass = schedule.some((s) => s.dayOfWeek === dow);
              return (
                <TouchableOpacity
                  key={dow}
                  onPress={() => setSelectedDay(dow)}
                  className={`flex-1 mx-0.5 py-3 rounded-xl items-center ${isActive ? "bg-blue-600" : "bg-gray-50"}`}
                >
                  <Text
                    className={`text-xs mb-1 ${isActive ? "text-white" : "text-gray-500"}`}
                    style={{ fontFamily: "Poppins-Medium" }}
                  >
                    {label}
                  </Text>
                  {hasClass && (
                    <View className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white" : "bg-blue-500"}`} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected day label */}
          <Text className="text-black text-sm mb-4" style={{ fontFamily: "Poppins-SemiBold" }}>
            {DAY_FULL[selectedDay - 1]}
          </Text>

          {/* Schedule list */}
          {loading ? (
            <View className="items-center py-10">
              <ActivityIndicator size="large" color="#136ADA" />
            </View>
          ) : dayItems.length === 0 ? (
            <View className="items-center py-10">
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-400 mt-3 text-sm" style={{ fontFamily: "Poppins-Regular" }}>
                No classes on this day
              </Text>
            </View>
          ) : (
            <View className="pb-24 gap-4">
              {dayItems.map((item) => (
                <View key={item.scheduleDetailId} className="flex-row">
                  {/* Time */}
                  <View className="w-20 items-end pr-3 pt-1">
                    <Text className="text-black text-xs" style={{ fontFamily: "Poppins-SemiBold" }}>
                      {item.timeRange.split(" - ")[0]}
                    </Text>
                    <Text className="text-gray-400 text-[10px]" style={{ fontFamily: "Poppins-Regular" }}>
                      {item.timeRange.split(" - ")[1]}
                    </Text>
                  </View>

                  {/* Timeline */}
                  <View className="items-center relative mr-3">
                    <View className="h-full w-[2px] bg-blue-100 absolute top-0" />
                    <View className="w-3 h-3 rounded-full bg-blue-600 mt-1.5" />
                  </View>

                  {/* Card */}
                  <View className={`flex-1 ${subjectColor(item.subjectName)} rounded-2xl p-4 flex-row items-center`}>
                    <View className="w-10 h-10 bg-white/60 rounded-full items-center justify-center mr-3">
                      <Ionicons name="book-outline" size={18} color="#136ADA" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-black text-sm" style={{ fontFamily: "Poppins-Bold" }}>
                        {item.subjectName}
                      </Text>
                      <Text className="text-gray-500 text-xs" style={{ fontFamily: "Poppins-Regular" }}>
                        {item.teacherName}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
