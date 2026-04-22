import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { examScheduleService } from "../../../services/examSchedule.service";
import { MyExamScheduleDetailResponse } from "../../../types/examSchedule";
import { useConfigStore } from "../../../store/configStore";
import { StatusBar } from "expo-status-bar";

export default function TeacherExamScheduleScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [schedules, setSchedules] = useState<MyExamScheduleDetailResponse[]>(
    [],
  );

  const [type, setType] = useState("Cuối kì");
  const [term, setTerm] = useState(1);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showTermModal, setShowTermModal] = useState(false);
  const { schoolYear } = useConfigStore();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await examScheduleService.getMyExamSchedule({
        type: type,
        term: term,
        schoolYear: schoolYear,
      });
      setSchedules(data);
    } catch (error) {
      console.error("Error fetching teacher exam schedule:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [type, term, schoolYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderExamCard = ({ item }: { item: MyExamScheduleDetailResponse }) => (
    <View className="px-6 mb-4">
      <View className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-black text-lg"
              >
                {item.subjectName}
              </Text>
            </View>
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-gray-400 text-xs"
            >
              {new Date(item.date).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>
          <View className="bg-blue-50 px-3 py-1.5 rounded-2xl">
            <Text
              style={{ fontFamily: "Poppins-Bold" }}
              className="text-bright-blue text-xs"
            >
              {item.roomName}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between pt-4 border-t border-gray-50">
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-gray-500 text-[11px]"
              >
                {item.startTime} - {item.finishTime}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const TypeDropdown = ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => {
    const [open, setOpen] = useState(false);
    const options = ["Giữa kì", "Cuối kì"];
    return (
      <>
        <TouchableOpacity
          onPress={() => setOpen(true)}
          className="flex-row items-center gap-2 px-4 py-2 rounded-xl border bg-blue-50 border-blue-200"
        >
          <Text
            className="text-blue-800 text-sm"
            style={{ fontFamily: "Poppins-SemiBold" }}
          >
            {value}
          </Text>
          <Ionicons name="chevron-down" size={14} color="#1e40af" />
        </TouchableOpacity>
        <Modal
          transparent
          visible={open}
          animationType="fade"
          onRequestClose={() => setOpen(false)}
        >
          <Pressable className="flex-1" onPress={() => setOpen(false)}>
            <View className="mt-36 mx-6 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-md">
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`px-5 py-3.5 border-b border-gray-50 ${value === opt ? "bg-blue-50" : ""}`}
                >
                  <Text
                    className={`text-sm ${value === opt ? "text-blue-700" : "text-gray-700"}`}
                    style={{
                      fontFamily:
                        value === opt ? "Poppins-SemiBold" : "Poppins-Regular",
                    }}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
      </>
    );
  };

  const TermDropdown = ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (v: number) => void;
  }) => {
    const [open, setOpen] = useState(false);
    const options = [1, 2];
    return (
      <>
        <TouchableOpacity
          onPress={() => setOpen(true)}
          className="flex-row items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50"
        >
          <Text
            className="text-gray-600 text-sm"
            style={{ fontFamily: "Poppins-Medium" }}
          >
            Học kỳ {value}
          </Text>
          <Ionicons name="chevron-down" size={14} color="#6B7280" />
        </TouchableOpacity>
        <Modal
          transparent
          visible={open}
          animationType="fade"
          onRequestClose={() => setOpen(false)}
        >
          <Pressable className="flex-1" onPress={() => setOpen(false)}>
            <View className="mt-36 mx-6 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-md">
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`px-5 py-3.5 border-b border-gray-50 ${value === opt ? "bg-blue-50" : ""}`}
                >
                  <Text
                    className={`text-sm ${value === opt ? "text-blue-700" : "text-gray-700"}`}
                    style={{
                      fontFamily:
                        value === opt ? "Poppins-SemiBold" : "Poppins-Regular",
                    }}
                  >
                    Học kỳ {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
      </>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar hidden />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className="text-black text-lg"
        >
          Lịch thi
        </Text>
        <View className="w-10" />
      </View>

      {/* Filter Row */}
      <View className="px-6 py-4 flex-row gap-3 items-center">
        {/* Type Dropdown */}
        <TypeDropdown value={type} onChange={setType} />

        {/* Term Dropdown */}
        <TermDropdown value={term} onChange={setTerm} />
      </View>

      <FlatList
        data={schedules}
        keyExtractor={(item) => item.examScheduleDetailId}
        renderItem={renderExamCard}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#136ADA"
          />
        }
        ListEmptyComponent={
          loading && !refreshing ? (
            <View className="py-20">
              <ActivityIndicator size="large" color="#136ADA" />
            </View>
          ) : (
            <View className="py-20 px-10 items-center">
              <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
                <Ionicons name="calendar-outline" size={40} color="#D1D5DB" />
              </View>
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-gray-400 text-center"
              >
                Không có lịch thi nào
              </Text>
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-300 text-[10px] text-center mt-1"
              >
                Vui lòng kiểm tra lại sau hoặc thay đổi bộ lọc bên trên.
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
