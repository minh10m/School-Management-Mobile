import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { attendanceService } from "../../../services/attendance.service";
import { classYearService } from "../../../services/classYear.service";
import { WeeklyAttendanceResponse } from "../../../types/attendance";
import { SCHOOL_YEAR } from "../../../constants/config";

const DAYS_OF_WEEK = ["T2", "T3", "T4", "T5", "T6"];

export default function WeeklyAttendanceStatistics() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [homeroom, setHomeroom] = useState<any>(null);
  const [stats, setStats] = useState<WeeklyAttendanceResponse[]>([]);
  
  // Initialize with current week's Monday
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const day = now.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const hr = await classYearService.getHomeroomClass(Number(SCHOOL_YEAR.split("-")[0]));
      setHomeroom(hr);
      if (hr) {
        await fetchWeeklyStats(hr.classYearId, startDate);
      }
    } catch (error) {
      console.error("Failed to fetch homeroom:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyStats = async (classYearId: string, start: Date) => {
    try {
      const formattedDate = start.toISOString().split("T")[0];
      const data = await attendanceService.getWeeklyAttendance({
        classYearId,
        startDate: formattedDate,
      });
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch weekly stats:", error);
      setStats([]);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (homeroom && startDate) {
      fetchWeeklyStats(homeroom.classYearId, startDate);
    }
  }, [startDate, homeroom]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  const handlePrevWeek = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() - 7);
    setStartDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + 7);
    setStartDate(newDate);
  };

  const dateRangeString = useMemo(() => {
    const end = new Date(startDate);
    end.setDate(end.getDate() + 4); // Mon to Fri
    
    const options: any = { day: '2-digit', month: '2-digit' };
    return `${startDate.toLocaleDateString('vi-VN', options)} - ${end.toLocaleDateString('vi-VN', options)}`;
  }, [startDate]);

  const totals = useMemo(() => {
    let present = 0, absent = 0, late = 0;
    stats.forEach(student => {
      student.details.forEach(detail => {
        const dDate = new Date(detail.date);
        const day = dDate.getDay();
        if (day >= 1 && day <= 5) { // T2-T6
            if (detail.status === "Có mặt") present++;
            else if (detail.status === "Vắng mặt") absent++;
            else if (detail.status === "Đi trễ") late++;
        }
      });
    });
    return { present, absent, late };
  }, [stats]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar hidden />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            className="text-black text-lg"
            style={{ fontFamily: "Poppins-Bold" }}
          >
            Thống kê điểm danh tuần
          </Text>
          <Text
            className="text-gray-400 text-[10px] uppercase tracking-widest"
            style={{ fontFamily: "Poppins-Medium" }}
          >
            Lớp {homeroom?.className}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#136ADA"
          />
        }
      >
        {/* Week Selector */}
        <View className="px-6 py-6 bg-gray-50/50">
          <View className="flex-row items-center justify-between bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <TouchableOpacity 
              onPress={handlePrevWeek}
              className="w-10 h-10 items-center justify-center rounded-xl bg-gray-50"
            >
              <Ionicons name="chevron-back" size={20} color="#136ADA" />
            </TouchableOpacity>
            
            <View className="items-center">
              <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-800 text-sm">
                {dateRangeString}
              </Text>
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[10px] uppercase">
                {startDate.getFullYear()}
              </Text>
            </View>
            
            <TouchableOpacity 
              onPress={handleNextWeek}
              className="w-10 h-10 items-center justify-center rounded-xl bg-gray-50"
            >
              <Ionicons name="chevron-forward" size={20} color="#136ADA" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Global Summary Cards */}
        <View className="flex-row px-6 gap-x-3 mb-6 mt-4">
          <SummaryCard 
            label="Có mặt" 
            value={totals.present} 
            color="#10B981" 
            bg="bg-emerald-50" 
            icon="checkmark-circle"
          />
          <SummaryCard 
            label="Vắng" 
            value={totals.absent} 
            color="#EF4444" 
            bg="bg-rose-50" 
            icon="close-circle"
          />
          <SummaryCard 
            label="Muộn" 
            value={totals.late} 
            color="#F59E0B" 
            bg="bg-amber-50" 
            icon="time"
          />
        </View>

        {/* Student List */}
        <View className="px-6 pb-20">
          <View className="flex-row items-center justify-between mb-4 px-2">
            <Text style={{ fontFamily: "Poppins-Bold" }} className="text-gray-500 text-[10px] uppercase tracking-widest">
              Danh sách học sinh
            </Text>
            <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 text-[9px]">
              T2 → T6
            </Text>
          </View>

          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#136ADA" className="mt-20" />
          ) : stats.length === 0 ? (
            <View className="py-20 items-center">
              <Ionicons name="analytics-outline" size={48} color="#E5E7EB" />
              <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-400 mt-4">
                Chưa có dữ liệu thống kê
              </Text>
            </View>
          ) : (
            stats.map((student) => (
              <StudentRow key={student.studentId} student={student} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({ label, value, color, bg, icon }: any) {
  return (
    <View className={`flex-1 ${bg} p-4 rounded-[32px] border border-white/50 shadow-sm shadow-gray-100`}>
      <View className="w-10 h-10 bg-white rounded-full items-center justify-center mb-4 shadow-sm shadow-black/5">
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={{ fontFamily: "Poppins-Bold", color }} className="text-xl mb-0.5">
        {value}
      </Text>
      <Text style={{ fontFamily: "Poppins-Medium" }} className="text-gray-500 text-[9px] uppercase tracking-wider">
        {label}
      </Text>
    </View>
  );
}

function StudentRow({ student }: { student: WeeklyAttendanceResponse }) {
  const counts = useMemo(() => {
    let p = 0, a = 0, l = 0;
    student.details.forEach(d => {
        const dDate = new Date(d.date);
        const day = dDate.getDay();
        if (day >= 1 && day <= 5) {
            if (d.status === "Có mặt") p++;
            else if (d.status === "Vắng mặt") a++;
            else if (d.status === "Đi trễ") l++;
        }
    });
    return { p, a, l };
  }, [student.details]);

  return (
    <View className="bg-white border border-gray-50 rounded-[32px] p-5 mb-5 shadow-sm shadow-gray-100 flex-row items-center">
      <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mr-4 border border-white shadow-sm">
        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#136ADA] text-sm">
          {student.studentName.split(" ").at(-1)?.charAt(0)}
        </Text>
      </View>
      
      <View className="flex-1">
        <Text style={{ fontFamily: "Poppins-Bold" }} className="text-[#1E293B] text-sm mb-2" numberOfLines={1}>
          {student.studentName}
        </Text>
        
        <View className="flex-row gap-x-4">
          {DAYS_OF_WEEK.map((day, idx) => {
            const dayStatus = student.details.find(d => {
              const dDate = d.date ? new Date(d.date) : null;
              const jsDay = dDate ? (dDate.getDay() === 0 ? 6 : dDate.getDay() - 1) : -1;
              return jsDay === idx;
            });

            let dotColor = "#F1F5F9"; // Default bg-gray-100
            if (dayStatus) {
              if (dayStatus.status === "Có mặt") dotColor = "#10B981"; // bg-emerald-500
              else if (dayStatus.status === "Vắng mặt") dotColor = "#EF4444"; // bg-rose-500
              else if (dayStatus.status === "Đi trễ") dotColor = "#F59E0B"; // bg-amber-500
            }

            return (
              <View key={day} className="items-center">
                <View 
                  className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: dotColor }}
                />
                <Text className="text-[9px] text-gray-400 mt-1" style={{ fontFamily: "Poppins-Medium" }}>{day}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View className="flex-row gap-x-3 pl-4 border-l border-gray-100">
        <CountBadge value={counts.p} color="text-emerald-500" label="P" />
        <CountBadge value={counts.a} color="text-rose-500" label="A" />
        <CountBadge value={counts.l} color="text-amber-500" label="L" />
      </View>
    </View>
  );
}

function CountBadge({ value, color, label }: any) {
  return (
    <View className="items-center min-w-[24px]">
      <Text style={{ fontFamily: "Poppins-Bold" }} className={`text-[11px] ${color}`}>
        {value}
      </Text>
      <Text className="text-[8px] text-gray-300 uppercase tracking-tighter" style={{ fontFamily: 'Poppins-Medium' }}>{label}</Text>
    </View>
  );
}
