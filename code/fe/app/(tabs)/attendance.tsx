import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { attendanceService } from "../../services/attendance.service";
import { StudentAttendanceRecord, StudentAttendanceResponse } from "../../types/attendance";

const DAYS_OF_WEEK = ["S", "M", "T", "W", "T", "F", "S"];

function getStatusStyle(status: string | undefined) {
  if (status === "absent" || status === "Vắng mặt")
    return { circle: "bg-red-500", text: "text-white" };
  if (status === "late" || status === "Đi trễ")
    return { circle: "bg-orange-400", text: "text-white" };
  if (status === "present" || status === "Có mặt")
    return { circle: "bg-green-500", text: "text-white" };
  return { circle: "bg-transparent", text: "text-black" };
}

export default function AttendanceTab() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<StudentAttendanceResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAttendance();
  }, [month, year]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const result = await attendanceService.getMyAttendance({ month, year });
      setData(result);
    } catch (e) {
      console.error("Attendance load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const attendanceMap: Record<number, StudentAttendanceRecord> = {};
  data?.studentAttendances?.forEach((rec) => {
    const day = new Date(rec.date).getDate();
    attendanceMap[day] = rec;
  });

  const monthLabel = new Date(year, month - 1).toLocaleString("en-US", {
    month: "long", year: "numeric",
  });

  const presentPct =
    data && data.totalPresent + data.totalAbsent > 0
      ? Math.round((data.totalPresent / (data.totalPresent + data.totalAbsent)) * 100)
      : 0;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-black text-lg" style={{ fontFamily: "Poppins-Bold" }}>
          Attendance
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-4 pb-10">
          {/* Calendar */}
          <View className="bg-[#EAEAEA] rounded-3xl p-4 mb-6">
            <View className="flex-row justify-between items-center mb-4 bg-white rounded-xl py-2 px-3">
              <TouchableOpacity onPress={prevMonth}>
                <Ionicons name="chevron-back" size={20} color="black" />
              </TouchableOpacity>
              <Text className="text-black text-sm" style={{ fontFamily: "Poppins-Bold" }}>{monthLabel}</Text>
              <TouchableOpacity onPress={nextMonth}>
                <Ionicons name="chevron-forward" size={20} color="black" />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-between mb-4 px-2">
              {DAYS_OF_WEEK.map((d, i) => (
                <Text key={i} className="text-black text-xs w-[13%] text-center" style={{ fontFamily: "Poppins-Regular" }}>{d}</Text>
              ))}
            </View>

            {loading ? (
              <ActivityIndicator size="small" color="#136ADA" style={{ marginVertical: 20 }} />
            ) : (
              <View className="flex-row flex-wrap px-2">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <View key={`e-${i}`} className="w-[14.28%] aspect-square" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const rec = attendanceMap[day];
                  const { circle, text } = getStatusStyle(rec?.status);
                  return (
                    <View key={day} className="w-[14.28%] aspect-square items-center justify-center mb-2">
                      <View className={`w-8 h-8 items-center justify-center rounded-full ${circle}`}>
                        <Text className={`text-sm ${text}`} style={{ fontFamily: "Poppins-Medium" }}>{day}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Legend */}
          <View className="flex-row justify-center gap-5 mb-6">
            {[
              { color: "bg-green-500", label: "Present" },
              { color: "bg-red-500", label: "Absent" },
              { color: "bg-orange-400", label: "Late" },
            ].map((item) => (
              <View key={item.label} className="flex-row items-center">
                <View className={`w-3 h-3 rounded-full ${item.color} mr-2`} />
                <Text className="text-black text-xs" style={{ fontFamily: "Poppins-Medium" }}>{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Stats */}
          <View className="bg-blue-500 rounded-2xl p-5 flex-row items-center justify-around shadow-md">
            <View className="items-center">
              <Text className="text-white text-2xl" style={{ fontFamily: "Poppins-Bold" }}>{data?.totalPresent ?? 0}</Text>
              <Text className="text-blue-100 text-xs" style={{ fontFamily: "Poppins-Regular" }}>Present</Text>
            </View>
            <View className="w-px h-10 bg-blue-300" />
            <View className="items-center">
              <Text className="text-white text-2xl" style={{ fontFamily: "Poppins-Bold" }}>{data?.totalAbsent ?? 0}</Text>
              <Text className="text-blue-100 text-xs" style={{ fontFamily: "Poppins-Regular" }}>Absent</Text>
            </View>
            <View className="w-px h-10 bg-blue-300" />
            <View className="items-center">
              <Text className="text-white text-2xl" style={{ fontFamily: "Poppins-Bold" }}>{presentPct}%</Text>
              <Text className="text-blue-100 text-xs" style={{ fontFamily: "Poppins-Regular" }}>Attendance</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
