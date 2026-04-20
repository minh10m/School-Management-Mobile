import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { attendanceService } from "../../../services/attendance.service";
import {
  ClassAttendanceItem,
  AttendanceStatus,
} from "../../../types/attendance";
import { StatusBar } from "expo-status-bar";

export default function TakeAttendanceScreen() {
  const { classYearId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState<ClassAttendanceItem[]>([]);
  const [date] = useState(new Date().toISOString().split("T")[0]);

  const fetchData = useCallback(async () => {
    if (!classYearId) return;
    try {
      setLoading(true);
      const data = await attendanceService.getClassAttendance({
        classYearId: classYearId as string,
        date: date,
      });
      // Map Vietnamese status from backend to English for UI
      const mappedData = data.map((s) => {
        let status: AttendanceStatus = "present";
        if (s.status === "Đi trễ") status = "late";
        else if (s.status === "Vắng mặt") status = "absent";
        else if (s.status === "Có mặt") status = "present";
        else if (s.status === null) status = "present"; // Default

        return { ...s, status };
      });
      setStudents(mappedData);
    } catch (error) {
      console.error("Error fetching class students:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách học sinh.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [classYearId, date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const updateStatus = (studentId: string, status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status } : s)),
    );
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);

      // Map UI English status to Backend Vietnamese status
      const mappedAttendances = students.map((s) => {
        let statusStr = "Có mặt";
        if (s.status === "late") statusStr = "Đi trễ";
        else if (s.status === "absent") statusStr = "Vắng mặt";

        return {
          studentId: s.studentId,
          status: statusStr,
          note: s.note,
        };
      });

      const payload = {
        classYearId: classYearId as string,
        date: date,
        attendances: mappedAttendances,
      };

      await attendanceService.submitAttendance(payload as any);
      Alert.alert("Thành công", "Đã lưu điểm danh thành công!");
      router.back();
    } catch (error) {
      console.error("Error saving attendance:", error);
      Alert.alert("Lỗi", "Lưu điểm danh thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusOptions: {
    label: string;
    value: AttendanceStatus;
    color: string;
    bgColor: string;
  }[] = [
    {
      label: "Có mặt",
      value: "present",
      color: "#22C55E",
      bgColor: "#F0FDF4",
    },
    { label: "Đi trễ", value: "late", color: "#F97316", bgColor: "#FFF7ED" },
    {
      label: "Vắng mặt",
      value: "absent",
      color: "#F43F5E",
      bgColor: "#FFF1F2",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar hidden />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="items-center">
          <Text
            style={{ fontFamily: "Poppins-Bold" }}
            className="text-black text-lg"
          >
            Điểm danh
          </Text>
        </View>
        <View className="w-10" />
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#136ADA"
            />
          }
        >
          <View className="px-6 py-4">
            <View className="mb-6">
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-gray-500 text-sm uppercase tracking-wide"
              >
                {new Date(date).toLocaleDateString("vi-VN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </Text>
            </View>
            {students.map((item) => (
              <View
                key={item.studentId}
                className="bg-white p-5 rounded-3xl mb-4 border border-gray-100 shadow-sm"
              >
                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 rounded-2xl bg-blue-50 items-center justify-center mr-3 border border-blue-100">
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-[#136ADA] text-lg"
                    >
                      {item.studentName.charAt(0)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: "Poppins-Bold" }}
                      className="text-black text-base"
                      numberOfLines={1}
                    >
                      {item.studentName}
                    </Text>
                    <Text
                      style={{ fontFamily: "Poppins-Medium" }}
                      className="text-gray-400 text-[10px]"
                    >
                      MÃ HỌC SINH:{" "}
                      {item.studentId.substring(0, 8).toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-2">
                  {statusOptions.map((opt) => {
                    const isActive =
                      item.status === opt.value ||
                      (item.status === null && opt.value === "present");
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => updateStatus(item.studentId, opt.value)}
                        style={{
                          backgroundColor: isActive ? opt.color : "#F9FAFB",
                        }}
                        className="flex-1 py-3 rounded-2xl items-center"
                      >
                        <Text
                          style={{ fontFamily: "Poppins-Bold" }}
                          className={`text-[10px] ${isActive ? "text-white" : "text-gray-400"}`}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Floating Action Button */}
      {!loading && (
        <View className="absolute bottom-10 left-6 right-6">
          <TouchableOpacity
            onPress={handleSave}
            disabled={submitting}
            className={`h-16 rounded-3xl flex-row items-center justify-center shadow-lg ${submitting ? "bg-blue-300" : "bg-bright-blue"}`}
            style={{
              shadowColor: "#136ADA",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={24}
                  color="white"
                />
                <Text
                  style={{ fontFamily: "Poppins-Bold" }}
                  className="text-white text-lg ml-2"
                >
                  Lưu điểm danh
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
